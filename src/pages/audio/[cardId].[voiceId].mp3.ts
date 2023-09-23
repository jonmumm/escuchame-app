import type { APIRoute } from "astro";
import { z } from "astro/zod";
import { and, eq } from "drizzle-orm";
import { createVoiceTrack } from "../../lib/elevenlabs";
import { voiceTracks } from "../../schema";
import { assertNotNull } from "../../utils";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import db from "../../db";

const ParamsSchema = z.object({
  voiceId: z.string(),
  cardId: z.string(),
});

const getVoiceTrack = async (_db: PostgresJsDatabase, cardId: string, voiceId: string) => {
  const [res] = await _db
    .select()
    .from(voiceTracks)
    .where(
      and(eq(voiceTracks.cardId, cardId), eq(voiceTracks.voiceId, voiceId))
    );

  return res;
};

export const GET: APIRoute = async ({ params, request }) => {
  const { cardId, voiceId } = ParamsSchema.parse(params);

  const resp = await db.transaction(async (tx) => {
    let resp = await getVoiceTrack(tx, cardId, voiceId);
    if (!resp) {
      await createVoiceTrack(tx, cardId, voiceId);
      resp = await getVoiceTrack(tx, cardId, voiceId);
      assertNotNull(resp);
    }
    return resp;
  })

  const audioDataArrayBuffer = bufferToArrayBuffer(resp.data);
  return new Response(audioDataArrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg", // or whatever your audio type is
    },
  });
};

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
