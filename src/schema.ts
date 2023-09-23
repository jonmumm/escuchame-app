import type { InferModel } from "drizzle-orm";
import {
  customType,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { assert } from "./utils";

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export type Session = InferModel<typeof sessions>;
export type NewSession = InferModel<typeof sessions, "insert">;

export const voiceTracks = pgTable(
  "voice_tracks",
  {
    cardId: uuid("card_id").notNull(),
    voiceId: varchar("voice_id").notNull(),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.cardId, table.voiceId),
    };
  }
);
export type VoiceTrack = InferModel<typeof voiceTracks>;

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  cardId: uuid("card_id").notNull(),
  voiceId: varchar("voice_id").notNull(),
  value: integer("value"),
  previouslySeenCount: integer("previously_seen_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  shownAt: timestamp("shown_at"),
  submittedAt: timestamp("submitted_at"),
});
export type Review = InferModel<typeof reviews>;

export const cardsProgress = pgTable("cards_progress", {
  userId: uuid("user_id").references(() => users.id),
  cardId: uuid("card_id").notNull(),
  difficulty: real("difficulty").default(0.3).notNull(),
  daysBetweenReviews: real("days_between_reviews").default(1).notNull(),
  dateLastReviewed: timestamp("date_last_reviewed").notNull(),
});
