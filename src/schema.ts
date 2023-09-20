import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import type { InferModel } from 'drizzle-orm';

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export type Session = InferModel<typeof sessions>;
export type NewSession = InferModel<typeof sessions, "insert">;

export const responses = pgTable("responses", {
  id: uuid("id").primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id),
  cardId: integer("card_id").notNull(),
  value: integer('value').notNull(),
});

export type Response = InferModel<typeof responses>;
export type NewResponse = InferModel<typeof responses, "insert">;
