import type { APIRoute } from "astro";
import fs from "fs";
import { and, eq } from "drizzle-orm";
import db from "../../db";
import { voiceTracks } from "../../schema";
import { z } from "astro/zod";
import { assert } from "../../utils";

const ParamsSchema = z.object({
  voiceId: z.string(),
  cardId: z.string().uuid(),
});

export const GET: APIRoute = async ({ params, request }) => {
  const { cardId, voiceId } = ParamsSchema.parse(params);

  const [res] = await db
    .select()
    .from(voiceTracks)
    .where(
      and(eq(voiceTracks.cardId, cardId), eq(voiceTracks.voiceId, voiceId))
    );

  assert(res, "couldn't find track data for" + cardId + " " + voiceId);

  // Convert the Buffer to ArrayBuffer and return
  const audioDataArrayBuffer = bufferToArrayBuffer(res.data);
  return new Response(audioDataArrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg", // or whatever your audio type is
    },
  });
};

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
