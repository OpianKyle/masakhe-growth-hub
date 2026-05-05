import { queryOne, queryAll, execute } from "../../db";
import { randomUUID } from "crypto";

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface IChatStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    const row = await queryOne("SELECT * FROM ai_conversations WHERE id = ?", [id]);
    return row || undefined;
  },

  async getAllConversations() {
    return queryAll("SELECT * FROM ai_conversations ORDER BY created_at DESC");
  },

  async createConversation(title: string) {
    const result = await execute(
      "INSERT INTO ai_conversations (title, created_at) VALUES (?, NOW())",
      [title]
    );
    const id = (result as any).insertId;
    return queryOne("SELECT * FROM ai_conversations WHERE id = ?", [id]);
  },

  async deleteConversation(id: number) {
    await execute("DELETE FROM ai_messages WHERE conversation_id = ?", [id]);
    await execute("DELETE FROM ai_conversations WHERE id = ?", [id]);
  },

  async getMessagesByConversation(conversationId: number) {
    return queryAll(
      "SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC",
      [conversationId]
    );
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const result = await execute(
      "INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, NOW())",
      [conversationId, role, content]
    );
    const id = (result as any).insertId;
    return queryOne("SELECT * FROM ai_messages WHERE id = ?", [id]);
  },
};
