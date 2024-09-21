import { deepmerge } from "deepmerge-ts";
import type {
  ChatMessage,
  ChatPagination,
  ChatSessionDto,
  ChatSessionDtoOptions,
  ModelRoleType,
  UpdateChatSessionDto,
} from "./interface";
import ChatStorage from "./storage";
import { createMessageId } from "./utils";

export interface ChatSessionEvents {
  onUpdate?: () => void;
  onMessagesUpdate?: (sessionId: string, messages: ChatMessage[]) => void;
}

export interface ChatSessionOptions extends ChatSessionDtoOptions {
  sortDirection?: "ascend" | "descend";
  chatStorage: ChatStorage;
  events?: ChatSessionEvents;
}

export default class ChatSession implements ChatSessionDto {
  private messagesMap: Map<string, ChatMessage> = new Map();
  private events: ChatSessionEvents = {};
  private sortDirection: "ascend" | "descend" = "ascend";
  id;
  title = "";
  createAt = Date.now();
  updateAt?: number;
  extra?: any;
  creator?: string;
  latestMessageId?: string;
  chatStorage: ChatStorage;

  constructor({
    sortDirection,
    chatStorage,
    extra,
    events,
    id,
    ...otherOptions
  }: ChatSessionOptions) {
    this.chatStorage = chatStorage;
    this.id = id;
    Object.assign(this, otherOptions);
    if (extra) {
      this.extra = JSON.parse(extra);
    }
    if (events) {
      this.events = events;
    }
    if (sortDirection) {
      this.sortDirection = sortDirection;
    }
  }

  /**
   * 获取会话数据对象
   * @returns
   */
  getData(): ChatSessionDto {
    return {
      id: this.id,
      title: this.title,
      createAt: this.createAt,
      updateAt: this.updateAt,
      extra: JSON.stringify(this.extra),
      creator: this.creator,
    };
  }

  /**
   * 消息内容和角色生成消息对象
   * @param content
   * @param role
   * @returns
   */
  generateBaseMessage(content: string, role: ModelRoleType) {
    return {
      id: createMessageId(),
      content,
      role,
      createAt: Date.now(),
      updateAt: Date.now(),
      parentId: this.latestMessageId,
      sessionId: this.id,
    } as ChatMessage;
  }

  /**
   * 创建临时消息，不会写入存储
   * @param message
   * @returns
   */
  addTempMessage(message: ChatMessage) {
    const messageClone = { ...message };
    this.messagesMap.set(message.id, messageClone);
    this.updateAt = Date.now();
    this.latestMessageId = message.id;
    return messageClone;
  }

  /**
   * 更新临时消息
   * @param message
   * @returns
   */
  updateTempMessage(messageId: string, message: Partial<ChatMessage>) {
    const chatMessage = this.messagesMap.get(messageId);
    if (chatMessage) {
      Object.assign(chatMessage, message);
      return chatMessage;
    }
    return null;
  }

  /**
   * 获取指定id的消息（已载入的）
   * @param messageId
   * @returns
   */
  getMessage(messageId: string) {
    return this.messagesMap.get(messageId) ?? null;
  }

  /**
   * 获取已载入的消息列表
   * @param sortDirection "ascend" | "descend"
   * @returns
   */
  getMessages(sortDirection: "ascend" | "descend" = this.sortDirection) {
    const messages = Array.from(this.messagesMap.values()).sort((a, b) =>
      sortDirection === "descend"
        ? b.createAt - a.createAt
        : a.createAt - b.createAt
    );
    this.latestMessageId = messages.at(-1)?.id;
    return messages;
  }

  private onMessagesChange() {
    if (this.events.onMessagesUpdate) {
      this.events.onMessagesUpdate?.(this.id, this.getMessages());
    }
  }

  /**
   * 更新会话信息到存储器
   */
  async updateSession({
    extra,
    updateAt = Date.now(),
    title,
  }: Pick<ChatSessionDto, "title" | "updateAt"> & { extra?: any } = {}) {
    const dto: UpdateChatSessionDto = {
      id: this.id,
    };
    if (title) {
      this.title = title;
      dto.title = title;
    }
    this.updateAt = updateAt;
    if (extra) {
      this.extra = deepmerge(this.extra, extra);
      dto.extra = JSON.stringify(this.extra);
    }
    const success = await this.chatStorage.updateChatSession(dto);
    if (success) {
      this.events.onUpdate?.();
    }
    return success;
  }

  /**
   * 从存储器中载入消息列表
   * @param pageParams 分页参数
   * @param otherParams 其他参数
   * @returns
   */
  async loadChatMessages(pageParams: ChatPagination, otherParams?: any) {
    const messages = await this.chatStorage.getChatMessages(
      this.id,
      pageParams,
      otherParams
    );
    if (messages && messages.length > 0) {
      messages.forEach((message) => {
        this.messagesMap.set(message.id, message);
      });
      this.onMessagesChange();
      return messages;
    }
    return [];
  }

  private async addMessage(message: ChatMessage) {
    this.addTempMessage(message);
    this.onMessagesChange();
    const msgId = await this.chatStorage.addChatMessage(message);
    if (msgId) {
      this.updateTempMessage(message.id, {
        id: msgId,
      });
      this.latestMessageId = msgId;
      this.updateSession();
      this.onMessagesChange();
      return message;
    }
    return message;
  }

  /**
   * 删除消息
   * @param messageId
   * @returns
   */
  async deleteMessage(messageId: string) {
    if (this.messagesMap.has(messageId)) {
      const success = await this.chatStorage.deleteChatMessage(messageId);
      if (success) {
        this.messagesMap.delete(messageId);
        this.updateSession();
        this.onMessagesChange();
      } else {
        // TODO delete failed
      }
      return success;
    }
    // TODO message not found
    return false;
  }

  /**
   * 更新消息
   * @param messageId
   * @param message
   */
  async updateMessage(messageId: string, message: Partial<ChatMessage>) {
    const chatMessage = this.messagesMap.get(messageId);
    if (chatMessage) {
      const success = await this.chatStorage.updateChatMessage({
        id: messageId,
        ...message,
      });
      if (success) {
        this.updateSession();
        this.onMessagesChange();
        this.updateTempMessage(messageId, message);
      } else {
        // TODO update failed
      }
      return success;
    }
    // TODO message not found
    return false;
  }

  /**
   * 用户发送消息
   */
  sendMessage = (content: string) => {
    return this.addMessage(this.generateBaseMessage(content, "user"));
  };

  /**
   * 收到助手消息
   */
  receiveAssistantMessage(content: string) {
    return this.addMessage(this.generateBaseMessage(content, "assistant"));
  }

  /**
   * 收到消息
   */
  receiveMessage(content: string, role: string) {
    return this.addMessage(this.generateBaseMessage(content, role));
  }
}
