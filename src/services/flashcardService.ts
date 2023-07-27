import CARDS_DATA from "../data/cards.json";
import db from "../db";
import type { NewResponse, Response } from "../schema";
import { assertNotNull } from "../utils";

type Card = typeof CARDS_DATA[0];

// Fetch a flashcard by its ID from the JSON data
export async function getCardById(cardId: number): Promise<Card | undefined> {
  return CARDS_DATA.find((card: Card) => card.id === cardId);
}

// Fetch the next flashcard for the user
export async function getNextCard(): Promise<Card> {
  // This is a placeholder.
  // You might need to implement logic to decide what the 'next' card is
  return CARDS_DATA[0];
}

// Fetch the user's response to a flashcard
export async function getUserResponse(cardId: number, sessionId: number): Promise<Response> {
  const response: Response[] = await db
    .select()
    .from("responses")
    .where("cardId", cardId)
    .andWhere("sessionId", sessionId);
  return assertNotNull(response[0]);
}

// Save the user's response to a flashcard
export async function respondToCard(
  cardId: number,
  sessionId: number,
  response: number
): Promise<void> {
  const newResponse: NewResponse = {
    sessionId: sessionId,
    cardId: cardId,
    value: response,
  };
  await db.insert("responses").values(newResponse);
}
