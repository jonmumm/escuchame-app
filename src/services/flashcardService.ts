import { eq, isNull } from "drizzle-orm";
import cards from "../data/cards.json";
import voices from "../data/voices.json";
import db from "../db";
import {
  reviews,
  type Review,
  sessions,
} from "../schema";
import { assertNotNull } from "../utils";
import type { Card } from "../types";

export const getAudioUrl = (cardId: string, voiceId: string) => {
  return `/audio/${cardId}.${voiceId}.mp3`;
};

export async function getCurrentReview(sessionId: string) {
  const results: Review[] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.sessionId, sessionId))
    .where(isNull(reviews.value));
  const [row] = results;

  if (row) {
    return row;
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  assertNotNull(session);

  const { userId } = session;
  const cardId = await getNextCardId(userId);
  const voiceId = voices[Math.floor(Math.random() * (voices.length - 1))];
  const id = crypto.randomUUID();

  await db.insert(reviews).values({
    id,
    userId,
    sessionId,
    cardId,
    voiceId,
  });

  const [newRow] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.sessionId, sessionId))
    .where(isNull(reviews.value));
  return newRow;
}

// Gets the card id that is the most percent overdue
// If there are no cards that are overdue, uses the users
export async function getNextCardId(userId: string) {
  const index = Math.floor(Math.random() * (cards.length - 1));
  return cards[index].id;
}

export async function getCardById(cardId: string): Promise<Card> {
  const card = cards.find((card: Card) => card.id === cardId);
  if (!card) {
    throw new Error("couldn't find card " + cardId);
  }
  return card;
}

function getRandomElement<T>(list: T[]): T | undefined {
  if (list.length === 0) {
    return undefined; // Return undefined if the list is empty
  }

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
function getNewCardForUser(userId: string) {
  throw new Error("Function not implemented.");
}

function queryOrderedCardsForUser(userId: string) {
  throw new Error("Function not implemented.");
}
