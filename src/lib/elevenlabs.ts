import { z } from "astro/zod";
import { and, eq } from "drizzle-orm";
import cards from "../data/cards.json" assert { type: "json" };
import db from "../db";
import { voiceTracks } from "../schema";
import type { Card } from "../types";

const cardsById: Record<string, Card> = {};
cards.forEach((card) => {
  cardsById[card.id] = card;
});

const envSchema = z.object({
  ELEVENLABS_API_KEY: z.string(),
});
const { ELEVENLABS_API_KEY } = envSchema.parse(process.env);

export async function getVoiceTrack(
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
      and(eq(voiceTracks.cardId, card.id), eq(voiceTracks.voiceId, voiceId))
    );

  if (res) {
    return false;
  }

  createVoiceTrack(cardId, voiceId);
  return true;
};

export const createVoiceTrack = async (cardId: string, voiceId: string) => {
  const card = cardsById[cardId];

  const resp = await getVoiceTrack(voiceId, card.spanish);
  const data = (await resp.arrayBuffer()) as any;

  await db.insert(voiceTracks).values({
    cardId: card.id,
    voiceId,
    data,
  });
};
