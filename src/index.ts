import ChatSession from "./ChatSession";
import EventEmitter from "./EventEmitter";
import type {
  AddChatSessionDto,
  ChatPagination,
  ChatSessionDto,
  ChatSessionDtoOptions,
  UpdateChatSessionDto,
} from "./interface";
import ChatStorage, {
  type ChatStorageDriver,
  type DriverConfig,
} from "./storage";

export * from "./interface";
export * from "./storage";

export { default as ChatSession } from "./ChatSession";

export interface TinyChatOptions {
  sortDirection?: {
    chatSessions?: "ascend" | "descend";
    chatMessages?: "ascend" | "descend";
  };
}

export class TinyChat extends EventEmitter {
  private sessionMap: Map<string, ChatSession> = new Map();
  private chatStorage = new ChatStorage();
  private sortDirection: Required<TinyChatOptions>["sortDirection"] = {};

  constructor({ sortDirection }: TinyChatOptions = {}) {
    super();
    if (sortDirection) {
      this.sortDirection = sortDirection;
    }
  }

  /**
   * 配置存储驱动
   * @param config
   */
  config(config: DriverConfig) {
    this.chatStorage.config(config);
  }

  /**
   * 自定义存储驱动
   * @param driver
   */
  defineDriver(driver: ChatStorageDriver) {
    this.chatStorage.defineDriver(driver);
  }

  private defineChatSession(options: ChatSessionDtoOptions) {
    const _this = this;
    const chatSession = new ChatSession({
      ...options,
      chatStorage: this.chatStorage,
      sortDirection: this.sortDirection.chatMessages,
      events: {
        onUpdate() {
          _this.onChatSessionsUpdate();
        },
        onMessagesUpdate(sessionId, messages) {
          _this.emit("change:chatMessages", sessionId, messages);
        },
      },
    });
    this.sessionMap.set(chatSession.id, chatSession);
    return chatSession;
  }

  private onChatSessionsUpdate() {
    const chatSessions = this.getChatSessions();
    this.emit("change:chatSessions", chatSessions);
  }

  /**
   * 根据id获取会话
   * @param sessionId
   * @returns
   */
  getChatSession(sessionId: string) {
    return this.sessionMap.get(sessionId);
  }

  /**
   * 获取已载入的会话列表
   * @param sortDirection
   * @returns
   */
  getChatSessions(
    sortDirection: "ascend" | "descend" = this.sortDirection.chatSessions ??
      "ascend"
  ) {
    const getTime = (d: ChatSessionDto) => d.updateAt ?? d.createAt;
    return Array.from(this.sessionMap.values())
      .map((d) => d.getData())
      .sort((a, b) =>
        sortDirection === "descend"
          ? getTime(b) - getTime(a)
          : getTime(a) - getTime(b)
      );
  }

  /**
   * 根据id从存储器中载入会话
   * @param sessionId
   * @returns
   */
  async loadChatSession(sessionId: string) {
    const chatSession = this.sessionMap.get(sessionId);
    if (chatSession) {
      return chatSession;
    }
    const chatSessionDto = await this.chatStorage.getChatSession(sessionId);
    if (chatSessionDto) {
      const chatSession = this.defineChatSession(chatSessionDto);
      this.onChatSessionsUpdate();
      return chatSession;
    }
    return null;
  }

  /**
   * 从存储器中载入会话列表
   * @param pageParams 分页参数
   * @param otherParams 其他参数
   */
  async loadChatSessions(pageParams: ChatPagination, otherParams?: any) {
    const chatSessionOptions = await this.chatStorage.getChatSessions(
      pageParams,
      otherParams
    );
    if (chatSessionOptions && chatSessionOptions.length > 0) {
      const result: ChatSession[] = [];
      for (const option of chatSessionOptions) {
        const chatSession = this.sessionMap.get(option.id);
        if (chatSession) {
          continue;
        }
        result.push(this.defineChatSession(option));
      }
      this.onChatSessionsUpdate();
      return result;
    }
    return [];
  }

  /**
   * 创建并保存会话到存储器
   * @param dto
   * @returns
   */
  async addChatSession(dto: AddChatSessionDto) {
    const id = await this.chatStorage.addChatSession(dto);
    if (id) {
      const chatSession = this.defineChatSession({
        id,
        ...dto,
      });
      this.onChatSessionsUpdate();
      return chatSession;
    }
    // TODO error event
    return null;
  }

  /**
   * 修改会话（包括存储器）
   * @param dto
   * @returns
   */
  async updateChatSession(dto: UpdateChatSessionDto) {
    const chatSession = this.sessionMap.get(dto.id);
    if (chatSession) {
      const success = await chatSession.updateSession(dto);
      if (success) {
        // TODO update event
      } else {
        // TODO error event
      }
      return chatSession;
    }
    return null;
  }

  /**
   * 删除会话（包括存储器）
   * @param sessionId
   * @returns
   */
  async deleteChatSession(sessionId: string) {
    const success = await this.chatStorage.deleteChatSession(sessionId);
    if (success) {
      this.sessionMap.delete(sessionId);
      this.onChatSessionsUpdate();
    }
    return success;
  }

  /**
   * 载入指定会话中的消息
   */
  async loadChatMessages(
    sessionId: string,
    pageParams: ChatPagination,
    otherParams?: any
  ) {
    const chatSession = this.sessionMap.get(sessionId);
    if (chatSession) {
      return await chatSession.loadChatMessages(pageParams, otherParams);
    }
    return [];
  }
}

export default TinyChat;
