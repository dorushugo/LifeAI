import { db } from "./index";
import { chat, message } from "./schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Types
type NewChat = typeof chat.$inferInsert;
type NewMessage = typeof message.$inferInsert;

// Définition d'un type JSON robustes incluant les primitives
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// Chat Queries
export const chatQueries = {
  // Créer un nouveau chat
  create: async (userId: string, name: string) => {
    const newChat: NewChat = {
      id: nanoid(),
      name,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await db.insert(chat).values(newChat).returning();
  },

  // Récupérer tous les chats d'un utilisateur
  getAllByUserId: async (userId: string) => {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.updatedAt));
  },

  // Récupérer un chat spécifique
  getById: async (chatId: string) => {
    return await db.select().from(chat).where(eq(chat.id, chatId)).limit(1);
  },

  // Mettre à jour un chat
  update: async (chatId: string, data: Partial<NewChat>) => {
    return await db
      .update(chat)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(chat.id, chatId))
      .returning();
  },

  // Supprimer un chat
  delete: async (chatId: string) => {
    return await db.delete(chat).where(eq(chat.id, chatId)).returning();
  },
};

// Message Queries
export const messageQueries = {
  // Créer un nouveau message
  create: async (
    chatId: string,
    content: Json,
    role: "user" | "assistant" | "system"
  ) => {
    console.log("chatId in messageQueries", chatId);
    console.log("content in messageQueries", content);
    console.log("role in messageQueries", role);
    const newMessage: NewMessage = {
      id: nanoid(),
      chatId,
      content,
      role,
      createdAt: new Date().toISOString(),
    };

    return await db.insert(message).values(newMessage).returning();
  },

  // Récupérer tous les messages d'un chat
  getByChatId: async (chatId: string) => {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.createdAt));
  },

  // Récupérer un message spécifique
  getById: async (messageId: string) => {
    return await db
      .select()
      .from(message)
      .where(eq(message.id, messageId))
      .limit(1);
  },

  // Supprimer tous les messages d'un chat
  deleteByChatId: async (chatId: string) => {
    return await db.delete(message).where(eq(message.chatId, chatId));
  },

  // Supprimer un message spécifique
  delete: async (messageId: string) => {
    return await db.delete(message).where(eq(message.id, messageId));
  },
};
