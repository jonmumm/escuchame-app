import voice from "elevenlabs-node";
import Queue from "queue";
import fs from "fs-extra";
import data from "../src/data/cards.json" assert { type: "json" };
import voiceIds from "../src/data/voices.json" assert { type: "json" };

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error("couldn't find ELEVENLABS_API_KEY");
}

const queue = new Queue({
  concurrency: 3,
});

data.forEach((card) => {
  voiceIds.forEach((voiceId) => {
    const fileName = `public/audio/${card.id}.${voiceId}.mp3`;

    queue.push(() => {
      return voice.textToSpeech(apiKey, voiceId, fileName, card.spanish);
    });
  });
});

queue.addEventListener("success", (e) => {
  console.log({ e });
});

queue.start((err) => {
  if (err) throw err;
  console.log("all done!");
});

// queue.push(() => {
//   return new Promise((resolve, reject) => {
//     voice.textToSpeech(apiKey, voiceID, fileName, textInput).then((res) => {
//       console.log(res);
//     });
//   });
// });

// const fileName = "audio.mp3"; // The name of your audio file
// const textInput = "hola! me llamo juan. y tu?"; // The text you wish to convert to speech

// voice.textToSpeech(apiKey, voiceID, fileName, textInput).then((res) => {
//   console.log(res);
// });
