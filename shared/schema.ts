import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (extended for RelateAI)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // RelateAI custom fields
  phoneNumber: varchar("phone_number"),
  age: integer("age"),
  ageMode: varchar("age_mode", { enum: ["teen", "adult"] }).default("adult"), // auto-calculated based on age
  
  // Settings
  theme: varchar("theme", { enum: ["light", "dark", "gray", "auto"] }).default("auto"),
  ageHandlingEnabled: boolean("age_handling_enabled").default(false),
  ageHandlingPasscode: varchar("age_handling_passcode"), // bcrypt hashed
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vault: varchar("vault", { enum: ["normal", "temporary", "family", "friends"] }).notNull(),
  role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  model: varchar("model"), // e.g., "normal_teen", "temp_adult"
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  age: z.number().int().min(13, "Must be at least 13 years old").max(120).optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "gray", "auto"]).optional(),
  ageHandlingEnabled: z.boolean().optional(),
  ageHandlingPasscode: z.string().min(4, "Passcode must be at least 4 characters").optional(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
