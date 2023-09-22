import { and, eq } from "drizzle-orm";
import { getVoiceTrack } from "../src/lib/elevenlabs";
import Queue from "queue";
import cards from "../src/data/cards.json" assert { type: "json" };
import voiceIds from "../src/data/voices.json" assert { type: "json" };
import db from "../src/db";
import { voiceTracks } from "../src/schema";
import type { Card } from "../src/types";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error("couldn't find ELEVENLABS_API_KEY");
}

const queue = new Queue({
  concurrency: 1,
});

const maybeCreateVoiceTrack = async (card: Card, voiceId: string) => {
  const [res] = await db
    .select()
    .from(voiceTracks)
    .where(
      and(eq(voiceTracks.cardId, card.id), eq(voiceTracks.voiceId, voiceId))
    );

  if (res) {
    console.log("skipping " + " " + counter + " " + card.id + " " + voiceId);
    return false;
  }
  console.log("creating " + counter + " " + card.id + " " + voiceId);

  const resp = await getVoiceTrack(voiceId, card.spanish);
  const data = (await resp.arrayBuffer()) as any;

  await db.insert(voiceTracks).values({
    cardId: card.id,
    voiceId,
    data,
  });

  return true;
};

cards.forEach((card) => {
  voiceIds.forEach((voiceId) => {
    queue.push(() => maybeCreateVoiceTrack(card, voiceId));
  });
});

let counter = 0;
queue.addEventListener("success", (e) => {
  counter = counter + 1;
});

queue.start((err) => {
  if (err) throw err;
  console.log("all done!");
});
console.log("queue length", queue.length);
