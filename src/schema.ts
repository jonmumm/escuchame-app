import type { InferModel } from "drizzle-orm";
import {
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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
  shownAt: timestamp("shown_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});
export type Review = InferModel<typeof reviews>;

export const responses = pgTable("responses", {
  id: uuid("id").primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id),
  userId: uuid("user_id").references(() => users.id),
  cardId: uuid("card_id").notNull(),
  voiceId: varchar("voice_id").notNull(),
  value: integer("value").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export type Response = InferModel<typeof responses>;
export type NewResponse = InferModel<typeof responses, "insert">;

export const cardsProgress = pgTable("cards_progress", {
  userId: uuid("user_id").references(() => users.id),
  cardId: uuid("card_id").notNull(),
  difficulty: real("difficulty").default(0.3).notNull(),
  daysBetweenReviews: real("days_between_reviews").default(1).notNull(),
  dateLastReviewed: timestamp("date_last_reviewed"),
});
