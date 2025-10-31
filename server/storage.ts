import {
  users,
  chatMessages,
  type User,
  type UpsertUser,
  type UpdateProfile,
  type UpdateSettings,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateProfile(userId: string, profile: UpdateProfile): Promise<User>;
  
  // Settings operations
  updateSettings(userId: string, settings: UpdateSettings): Promise<User>;
  
  // Chat message operations
  getMessages(userId: string, vault: string): Promise<ChatMessage[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteTemporaryMessages(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateProfile(userId: string, profile: UpdateProfile): Promise<User> {
    const updateData: any = { ...profile, updatedAt: new Date() };
    
    // Auto-calculate age mode based on age
    if (profile.age !== undefined) {
      updateData.ageMode = profile.age < 18 ? "teen" : "adult";
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async updateSettings(userId: string, settings: UpdateSettings): Promise<User> {
    const updateData: any = { ...settings, updatedAt: new Date() };
    
    // Hash passcode if provided
    if (settings.ageHandlingPasscode) {
      updateData.ageHandlingPasscode = await bcrypt.hash(settings.ageHandlingPasscode, 10);
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async getMessages(userId: string, vault: string): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          eq(chatMessages.vault, vault as any)
        )
      )
      .orderBy(chatMessages.createdAt);
    
    return messages;
  }

  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    
    return newMessage;
  }

  async deleteTemporaryMessages(userId: string): Promise<void> {
    await db
      .delete(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          eq(chatMessages.vault, "temporary")
        )
      );
  }
}

export const storage = new DatabaseStorage();
