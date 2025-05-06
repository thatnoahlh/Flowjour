import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: text("date").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

// Flowers table
export const flowers = pgTable("flowers", {
  id: text("id").primaryKey(),
  journalId: text("journal_id").references(() => journalEntries.id).notNull(),
  answers: text("answers").notNull(), // Store as string like "ABCADCBDAC"
  journalDate: text("journal_date").notNull(),
  journalTitle: text("journal_title").notNull(),
  created: text("created").notNull(),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  positionZ: integer("position_z").notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  userId: true,
});

export const insertFlowerSchema = createInsertSchema(flowers);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertFlower = z.infer<typeof insertFlowerSchema>;
export type Flower = typeof flowers.$inferSelect;
