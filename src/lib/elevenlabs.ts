import { z } from "astro/zod";
import { and, eq } from "drizzle-orm";
import db from "../db";
import { voiceTracks } from "../schema";
import { getCardById } from "../services/flashcardService";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

const envSchema = z.object({
  ELEVENLABS_API_KEY: z.string(),
});
const { ELEVENLABS_API_KEY } = envSchema.parse(process.env);

export async function generateVoiceTrack(
  voiceId: string,
  text: string
): Promise<Response> {
  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0&output_format=mp3_44100_128`;

  const requestData = {
    text,
    model_id: "eleven_multilingual_v1",
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0,
      use_speaker_boost: true,
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error! Status: ${response.status}: ` + text);
  }

  return response;
}

export const maybeCreateVoiceTrack = async (
  cardId: string,
  voiceId: string
) => {
  const [res] = await db
    .select()
    .from(voiceTracks)
    .where(
      and(eq(voiceTracks.cardId, cardId), eq(voiceTracks.voiceId, voiceId))
    );

  if (res) {
    return false;
  }

  await createVoiceTrack(db, cardId, voiceId);
  return true;
};

export const createVoiceTrack = async (_db: PostgresJsDatabase, cardId: string, voiceId: string) => {
  const card = await getCardById(cardId);
  const resp = await generateVoiceTrack(voiceId, card.spanish!);
  const data = (await resp.arrayBuffer()) as any;

  await _db.insert(voiceTracks).values({
    cardId: card.id,
    voiceId,
    data,
  });
};
