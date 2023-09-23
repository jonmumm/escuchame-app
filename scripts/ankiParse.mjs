import crypto from "crypto";
import { writeFileSync } from "fs";
import { readFile, } from "fs/promises";

const FILENAME = "./src/data/spanish_9000.txt";

(async () => {
  const fileContents = await readFile(FILENAME, "utf8");

  const data = fileContents
    .split("\n")
    .map((line) => line.split("\t"))
    .map((tokens) => {
      const result = {
        id: crypto.randomUUID(),
        newWord: tokens[4],
        spanish: tokens[3],
        english: tokens[2],
        cloze: tokens[6],
      };

      return result;
    });

  writeFileSync("./src/data/cards.json", JSON.stringify(data, null, 2));

  console.log({data})
})();