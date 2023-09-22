import Queue from "queue";
import cards from "../src/data/cards.json" assert { type: "json" };
import voiceIds from "../src/data/voices.json" assert { type: "json" };
import { maybeCreateVoiceTrack } from "../src/lib/elevenlabs";

const queue = new Queue({
  concurrency: 1,
});

cards.forEach((card) => {
  voiceIds.forEach((voiceId) => {
    queue.push(() => maybeCreateVoiceTrack(card.id, voiceId));
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
