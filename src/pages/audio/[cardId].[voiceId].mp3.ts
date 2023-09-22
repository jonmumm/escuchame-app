import type { APIRoute } from "astro";
import { z } from "astro/zod";
import { and, eq } from "drizzle-orm";
import db from "../../db";
import { createVoiceTrack } from "../../lib/elevenlabs";
import { voiceTracks } from "../../schema";
import { assertNotNull } from "../../utils";

const ParamsSchema = z.object({
  voiceId: z.string(),
  cardId: z.string(),
});

const getVoiceTrack = async (cardId: string, voiceId: string) => {
  const [res] = await db
    .select()
    .from(voiceTracks)
    .where(
      and(eq(voiceTracks.cardId, cardId), eq(voiceTracks.voiceId, voiceId))
    );

  return res;
};

export const GET: APIRoute = async ({ params, request }) => {
  const { cardId, voiceId } = ParamsSchema.parse(params);

  let row = await getVoiceTrack(cardId, voiceId);
  if (!row) {
    await createVoiceTrack(cardId, voiceId);
    row = await getVoiceTrack(cardId, voiceId);
    assertNotNull(row);
  }

  const audioDataArrayBuffer = bufferToArrayBuffer(row.data);
  return new Response(audioDataArrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg", // or whatever your audio type is
    },
  });
};

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
