import type { ChatStorageDriver } from "./interface";
import type {
  AddChatMessageDto,
  AddChatSessionDto,
  ChatMessage,
  ChatPagination,
  ChatSessionDto,
  UpdateChatMessageDto,
  UpdateChatSessionDto,
} from "../interface";
import { createSessionId, createMessageId } from "../utils";

export default class MemoryDriver implements ChatStorageDriver {
  name: string;
  private sessionMap = new Map<string, ChatSessionDto>();
  private messageMap = new Map<string, ChatMessage>();
  constructor({ name }: { name: string }) {
    this.name = name;
  }
  /**
   * Chat Session
   */
  async getChatSessions(
    { current, pageSize }: ChatPagination,
    otherParams?: any
  ) {
    const sessions = Array.from(this.sessionMap.values());
    return sessions.slice((current - 1) * pageSize, current * pageSize);
  }
  async getChatSession(id: string) {
    return this.sessionMap.get(id);
  }
  async addChatSession(dto: AddChatSessionDto) {
    const id = createSessionId();
    this.sessionMap.set(id, {
      ...dto,
      id,
      createAt: Date.now(),
    });
    return id;
  }

  async updateChatSession(dto: UpdateChatSessionDto) {
    const session = this.sessionMap.get(dto.id);
    if (session) {
      Object.assign(session, dto);
      return true;
    }
    return false;
  }
  async deleteChatSession(id: string) {
    const session = this.sessionMap.get(id);
    if (session) {
      this.sessionMap.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Chat Message
   */
  async getChatMessages(
    sessionId: ChatSessionDto["id"],
    { current, pageSize }: ChatPagination,
    otherParams?: any
  ) {
    const messages = Array.from(this.messageMap.values()).filter(
      (m) => m.sessionId === sessionId
    );
    return messages.slice((current - 1) * pageSize, current * pageSize);
  }
  async addChatMessage(dto: AddChatMessageDto) {
    const id = createMessageId();
    this.messageMap.set(id, {
      ...dto,
      id,
      createAt: Date.now(),
    });
    return id;
  }
  async updateChatMessage(dto: UpdateChatMessageDto) {
    const message = this.messageMap.get(dto.id);
    if (message) {
      Object.assign(message, dto);
      return true;
    }
    return false;
  }
  async deleteChatMessage(id: string) {
    const message = this.messageMap.get(id);
    if (message) {
      this.messageMap.delete(id);
      return true;
    }
    return false;
  }
}
