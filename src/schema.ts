import { pgTable, text, timestamp, integer, bigserial } from 'drizzle-orm/pg-core';
import type { InferModel } from 'drizzle-orm';

export const users = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  email: text("email").notNull().unique(),
});

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export const sessions = pgTable("sessions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: bigserial("user_id", { mode: "number" }).references(() => users.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export type Session = InferModel<typeof sessions>;
export type NewSession = InferModel<typeof sessions, "insert">;

export const responses = pgTable("responses", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sessionId: bigserial("session_id", { mode: "number" }).references(() => sessions.id),
  cardId: integer("card_id").notNull(),
  value: integer('value').notNull(),
});

export type Response = InferModel<typeof responses>;
export type NewResponse = InferModel<typeof responses, "insert">;
