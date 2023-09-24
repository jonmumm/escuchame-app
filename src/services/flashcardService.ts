import crypto from "crypto"; // Assuming you're using the Node.js 'crypto' module
import { and, asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { mean, linearRegression } from "simple-statistics";
import cards from "../data/cards.json";
import voices from "../data/voices.json";
import { cardsProgress, reviews, sessions } from "../schema";
import type { Card } from "../types";
import { assertNotNull } from "../utils";
import { maybeCreateVoiceTrack } from "../lib/elevenlabs";

export const getAudioUrl = (cardId: string, voiceId: string) => {
  return `/audio/${cardId}.${voiceId}.mp3`;
};

export async function getCurrentReview(
  _db: PostgresJsDatabase,
  sessionId: string,
) {
  const [row] = await _db
    .select()
    .from(reviews)
    .where(and(eq(reviews.sessionId, sessionId), isNull(reviews.value)))
    .orderBy(asc(reviews.createdAt));
  return row;
}

async function getUserIdFromSession(
  _db: PostgresJsDatabase,
  sessionId: string,
) {
  const [row] = await _db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  return row.userId;
}

async function getCurrentQueueSize(_db: PostgresJsDatabase, sessionId: string) {
  const [countQueryRow] = await _db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(and(eq(reviews.sessionId, sessionId), isNull(reviews.value)));
  assertNotNull(countQueryRow);
  return countQueryRow.count;
}

async function getOverdueCardIds(
  _db: PostgresJsDatabase,
  userId: string,
): Promise<string[]> {
  const today = new Date();
  const overdueCardIds: string[] = [];

  // Fetch all cards progress for the user
  const userCardProgresses = await _db
    .select()
    .from(cardsProgress)
    .where(eq(cardsProgress.userId, userId));

  for (const cardProgress of userCardProgresses) {
    const daysSinceLastReview =
      (today.getTime() - new Date(cardProgress.dateLastReviewed).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSinceLastReview > cardProgress.daysBetweenReviews) {
      overdueCardIds.push(cardProgress.cardId);
    }
  }

  return overdueCardIds;
}

export async function arrangeReviewQueue(
  _db: PostgresJsDatabase,
  sessionId: string,
  queueSize: number,
) {
  // 1. Fetch user ID from session ID
  const userId = await getUserIdFromSession(_db, sessionId);

  // 2. Determine current queue size
  const currentQueueSize = await getCurrentQueueSize(_db, sessionId);

  // 3. Fetch overdue cards
  const overdueCards = await getOverdueCardIds(_db, userId);

  let cardsToAdd = queueSize - currentQueueSize;

  // List to hold the selected cards
  const selectedCards = [];

  // 4a. Fill with overdue cards first
  if (overdueCards.length > 0) {
    let overdueToAdd = Math.min(overdueCards.length, cardsToAdd);
    selectedCards.push(...overdueCards.slice(0, overdueToAdd));
    cardsToAdd -= overdueToAdd;
  }

  // 4b. If still need more cards, fill with new cards based on user progress
  if (cardsToAdd > 0) {
    const newCards = await getNewCards(_db, userId, cardsToAdd);
    selectedCards.push(...newCards);
  }

  // Add the selected cards to the review queue
  for (const card of selectedCards) {
    await addToReviewQueue(_db, sessionId, card);
  }
}

export async function addToReviewQueue(
  _db: PostgresJsDatabase,
  sessionId: string,
  cardId: string,
): Promise<void> {
  // Generate a unique ID for the new review
  const id = crypto.randomUUID();

  // Assign a random voiceId from the voices list
  const voiceId = voices[Math.floor(Math.random() * voices.length)];

  maybeCreateVoiceTrack(cardId, voiceId).then(() => {
    // this is to preload the track
    // no-op here
  });

  // Fetch user ID from session ID
  const userId = await getUserIdFromSession(_db, sessionId);

  // Count the number of previously seen reviews
  _db.transaction(async (tx) => {
    const [countQueryRow] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.cardId, cardId),
          isNotNull(reviews.submittedAt),
        ),
      );
    const previouslySeenCount = countQueryRow.count;

    // Insert the card into the reviews table
    await tx.insert(reviews).values({
      id,
      userId,
      sessionId,
      previouslySeenCount,
      cardId,
      voiceId,
    });
  });
}

const TARGET_NEW_CARD_SUCCESS_RATE = 0.5; // the long-term target for what % of cards we want to get right on the first try.

const NUM_CARDS_TO_LEARN_INDEX = 25; // number of cards we use to adjust the learning rate
// todo once we have completed this amount of cards, just always use the lastIndex to start from

export async function getNewCards(
  _db: PostgresJsDatabase,
  userId: string,
  cardsToAdd: number,
): Promise<string[]> {
  // 1. Get the average first-time success rate
  const successRate = await getNewCardSuccessRate(_db, userId);

  // 2. Get the last index we used
  const lastIndex = await getLastNewCardIndex(_db, userId);

  // 3. Calculate a learning rate from 0-1 that scales how far we "step" from the last index
  const numCardsSeen = await getNumberOfCardsSeen(_db, userId);
  const learningRate = 1 / (1 + numCardsSeen / NUM_CARDS_TO_LEARN_INDEX);

  const completedCardIds = await getCompletedCardIds(_db, userId);

  const cardStackLength = cards.length;

  // ... [rest of your code]

  const deviation = successRate - TARGET_NEW_CARD_SUCCESS_RATE;

  // Calculate the maximum adjustment based on a fraction (e.g., 10%) of cardStackLength
  const maxAdjustment = cardStackLength * 0.1 * deviation;

  // Apply the learningRate to moderate the adjustment
  const adjustment = maxAdjustment * learningRate;

  let startIndex = lastIndex + Math.round(adjustment);

  // Ensure startIndex is within valid range
  startIndex = Math.max(0, Math.min(startIndex, cardStackLength / 2));

  // 4. Walk forward from the start index until you have reached 'cardsToAdd', excluding any cards we've already done
  let selectedCards = [];
  for (
    let i = startIndex;
    i < cards.length && selectedCards.length < cardsToAdd;
    i++
  ) {
    if (!completedCardIds.includes(cards[i].id)) {
      selectedCards.push(cards[i].id);
    }
  }

  // 5. If the index goes beyond the length of the cards list, walk backward from the start index until you've reached 'cardsToAdd'
  for (
    let i = startIndex - 1;
    selectedCards.length < cardsToAdd && i >= 0;
    i--
  ) {
    if (!completedCardIds.includes(cards[i].id)) {
      selectedCards.push(cards[i].id);
    }
  }

  return selectedCards;
}

async function get(_db: PostgresJsDatabase, userId: string): Promise<number> {
  const [row] = await _db
    .select({ avg: sql<number>`avg(difficulty)` })
    .from(reviews)
    .where(and(eq(reviews.userId, userId)));
  console.log(row.avg);
  return row?.avg ? row.avg : 0.3;
}

async function getAverageCompletedDifficulty(
  _db: PostgresJsDatabase,
  userId: string,
): Promise<number> {
  const [row] = await _db
    .select({ avg: sql<number>`avg(difficulty)` })
    .from(cardsProgress)
    .where(eq(cardsProgress.userId, userId));
  console.log(row.avg);
  return row?.avg ? row.avg : 0.3;
}

async function getNumberOfCardsSeen(
  _db: PostgresJsDatabase,
  userId: string,
): Promise<number> {
  const [row] = await _db
    .select({ count: sql<number>`count(*)::int` })
    .from(cardsProgress)
    .where(eq(cardsProgress.userId, userId));
  return row?.count || 0;
}

async function getAverageCompletedIndex(
  _db: PostgresJsDatabase,
  userId: string,
): Promise<number> {
  const result = await _db
    .select()
    .from(cardsProgress)
    .where(eq(cardsProgress.userId, userId));
  console.log(result.length);
  return result.length ? mean(result.map((r) => cardsById[r.cardId].index)) : 0;
}

async function getCompletedCardIds(
  _db: PostgresJsDatabase,
  userId: string,
): Promise<string[]> {
  const result = await _db
    .select()
    .from(cardsProgress)
    .where(eq(cardsProgress.userId, userId));
  return result.map((r) => r.cardId);
}

// export async function getNewCards(
//   _db: PostgresJsDatabase,
//   userId: string,
//   cardsToAdd: number
// ): Promise<string[]> {
//   const successProbs = await predictSuccessProbabilities(_db, userId);
//   const { successRate, averageIndex } = await getAverageNewCardSuccessRate(
//     _db,
//     userId
//   );

//   console.log({ averageIndex, successRate });

//   // Fetch already reviewed cards
//   const userReviews = await _db
//     .select()
//     .from(reviews)
//     .where(and(eq(reviews.userId, userId), eq(reviews.previouslySeenCount, 0)));
//   const reviewedCardIds = userReviews.map((review) => review.cardId); // Assuming the property is named cardId

//   // Sort cards based on their predicted success probabilities and filter out already reviewed ones
//   const sortedCardIds = Object.entries(successProbs)
//     .filter(([cardId]) => !reviewedCardIds.includes(cardId))
//     .sort(([, probA], [, probB]) => probA - probB)
//     .map(([cardId]) => cardId);

//   // Find the card with the closest success rate to the target
//   const closestCardIndex = sortedCardIds.findIndex((cardId) => {
//     return (
//       Math.abs(successProbs[cardId] - TARGET_NEW_CARD_SUCCESS_RATE) ===
//       Math.min(
//         ...sortedCardIds.map((id) =>
//           Math.abs(successProbs[id] - TARGET_NEW_CARD_SUCCESS_RATE)
//         )
//       )
//     );
//   });

//   // Determine the mid value between averageIndex and the closest card's index
//   const midValueIndex = Math.floor((averageIndex + closestCardIndex) / 2);

//   // Starting from this mid value, begin taking cards up to cardsToAdd
//   const selectedCards = sortedCardIds.slice(
//     midValueIndex,
//     midValueIndex + cardsToAdd
//   );

//   return selectedCards;
// }

// export async function getNewCards(
//   _db: PostgresJsDatabase,
//   userId: string,
//   cardsToAdd: number
// ): Promise<string[]> {
//   const successProbs = await predictSuccessProbabilities(_db, userId);
//   const { successRate, averageIndex } = await getAverageNewCardSuccessRate(
//     _db,
//     userId
//   );

//   console.log({ averageIndex, successRate });

//   // todo use the predicted success probabilties, the existing avg new card success, and the average index we've used so far
//   // to essentialy do a binary-search that tries to get the long term avg new card success to
//   // match that of TARGET_NEW_CARD_SUCCESS_RATE
//   throw new Error("unimplemted");
// }

type CardWithIndex = Card & { index: number };

const cardsById: Record<string, CardWithIndex> = {};
cards.forEach((card, index) => {
  cardsById[card.id] = {
    ...card,
    index,
  };
});

export async function getCardById(cardId: string): Promise<CardWithIndex> {
  const card = cardsById[cardId];
  if (!card) {
    throw new Error("couldn't find card " + cardId);
  }
  return card;
}

export async function updateCardProgress(
  db: PostgresJsDatabase,
  cardId: string,
  userId: string,
  performanceRating: number,
): Promise<void> {
  // Fetch card's current progress
  const [cardProgress] = await db
    .select()
    .from(cardsProgress)
    .where(
      and(eq(cardsProgress.cardId, cardId), eq(cardsProgress.userId, userId)),
    );

  let difficulty: number;
  let daysBetweenReviews: number;
  let dateLastReviewed: Date;
  let percentOverdue: number;

  if (cardProgress) {
    // Extract existing values
    ({ difficulty, daysBetweenReviews, dateLastReviewed } = cardProgress);
  } else {
    // Set default values for a new card
    difficulty = 0.3;
    daysBetweenReviews = 1;
    dateLastReviewed = new Date(); // Set to current date
  }

  // Calculate percentOverdue based on performanceRating
  if (performanceRating >= 0.6) {
    const daysSinceLastReview =
      (new Date().getTime() - dateLastReviewed.getTime()) /
      (1000 * 60 * 60 * 24);
    percentOverdue = Math.min(2, daysSinceLastReview / daysBetweenReviews);
  } else {
    percentOverdue = 1;
  }

  // Update difficulty
  difficulty += percentOverdue * (1 / 17) * (8 - 9 * performanceRating);
  difficulty = Math.max(0, Math.min(1, difficulty)); // Clamp to [0, 1]

  // Update difficultyWeight and daysBetweenReviews
  const difficultyWeight = 3 - 1.7 * difficulty;
  if (performanceRating >= 0.6) {
    daysBetweenReviews *=
      1 +
      (difficultyWeight - 1) * percentOverdue * (0.95 + Math.random() * 0.1);
  } else {
    daysBetweenReviews *= 1 / (1 + 3 * difficulty);
    daysBetweenReviews = Math.max(1, daysBetweenReviews); // max days = 1
  }

  dateLastReviewed = new Date(); // Update the dateLastReviewed to current date

  // Update the card's progress in the database
  if (cardProgress) {
    await db
      .update(cardsProgress)
      .set({
        difficulty,
        daysBetweenReviews,
        dateLastReviewed,
      })
      .where(
        and(eq(cardsProgress.cardId, cardId), eq(cardsProgress.userId, userId)),
      );
  } else {
    // Create an initial entry in the database
    await db.insert(cardsProgress).values({
      cardId,
      userId,
      difficulty,
      daysBetweenReviews,
      dateLastReviewed,
    });
  }
}

async function getNewCardSuccessRate(_db: PostgresJsDatabase, userId: string) {
  const userReviews = await _db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.previouslySeenCount, 0),
        isNotNull(reviews.value),
      ),
    );

  return userReviews.length
    ? mean(userReviews.map((review) => review.value!))
    : TARGET_NEW_CARD_SUCCESS_RATE;
}

async function getLastNewCardIndex(_db: PostgresJsDatabase, userId: string) {
  const [review] = await _db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.previouslySeenCount, 0),
        isNotNull(reviews.submittedAt),
      ),
    )
    .orderBy(desc(reviews.submittedAt))
    .limit(1);

  if (review) {
    return cardsById[review.cardId].index;
  } else {
    return 0;
  }
}

export async function predictSuccessProbabilities(
  _db: PostgresJsDatabase,
  userId: string,
): Promise<Record<string, number>> {
  // Fetch the user's first-time responses (previously_seen_count = 0 and not null value)
  const userResponses = await _db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.previouslySeenCount, 0),
        isNotNull(reviews.value),
      ),
    );

  const seenCardIds = new Set(userResponses.map((review) => review.cardId));

  // Convert responses to 1s and 0s (1 for correct, 0 for incorrect)
  const outcomes = userResponses.map((r) => (r.value! > 0 ? 1 : 0)); // Assuming value > 0 means correct

  // Fetch the indices of the cards the user responded to using the cardsById map
  const indices = userResponses.map((r) => cardsById[r.cardId].index);

  // Fit a linear regression model
  const regressionData = indices.map((index, idx) => [index, outcomes[idx]]);
  const regression = linearRegression(regressionData);

  // Compute predictions for all cards that the user hasn't seen yet
  const allCardIds = Object.keys(cardsById);
  const predictedScores: Record<string, number> = {};

  for (const cardId of allCardIds) {
    if (!seenCardIds.has(cardId)) {
      const cardIndex = cardsById[cardId].index;
      predictedScores[cardId] = regression.m * cardIndex + regression.b;
    }
  }

  return predictedScores;
}
