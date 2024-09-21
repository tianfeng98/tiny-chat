import type {
  AddChatMessageDto,
  AddChatSessionDto,
  ChatMessage,
  ChatPagination,
  ChatSessionDto,
  UpdateChatMessageDto,
  UpdateChatSessionDto,
} from "../interface";

export interface ChatStorageDriver {
  name: string;
  /**
   * Chat Session
   */
  getChatSessions: (
    pageParams: ChatPagination,
    otherParams?: any
  ) => Promise<ChatSessionDto[] | undefined>;
  getChatSession: (id: string) => Promise<ChatSessionDto | undefined>;
  addChatSession: (
    dto: AddChatSessionDto
  ) => Promise<ChatSessionDto["id"] | undefined>;
  updateChatSession: (dto: UpdateChatSessionDto) => Promise<boolean>;
  deleteChatSession: (id: string) => Promise<boolean>;

  /**
   * Chat Message
   */
  getChatMessages: (
    sessionId: ChatSessionDto["id"],
    pageParams: ChatPagination,
    otherParams?: any
  ) => Promise<ChatMessage[] | undefined>;
  addChatMessage: (dto: AddChatMessageDto) => Promise<string | undefined>;
  updateChatMessage: (dto: UpdateChatMessageDto) => Promise<boolean>;
  deleteChatMessage: (id: string) => Promise<boolean>;
}

export interface DriverConfig {
  name: string;
}
