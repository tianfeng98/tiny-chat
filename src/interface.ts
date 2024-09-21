/**
 * 会话
 */
export interface ChatSessionDto {
  title?: string;
  /**
   * 创建者
   */
  creator?: string;
  createAt: number;
  id: string;
  updateAt?: number;
  /**
   * 额外信息 序列化
   */
  extra?: string;
}

export type ChatSessionDtoOptions = Pick<ChatSessionDto, "id"> &
  Omit<Partial<ChatSessionDto>, "id">;

export type AddChatSessionDto = Pick<ChatSessionDto, "title" | "extra">;

export type UpdateChatSessionDto = Pick<ChatSessionDto, "id"> &
  AddChatSessionDto;

/**
 * 消息
 */
export interface ChatMessageError {
  body?: any;
  message: string;
  type: string | number;
}

export type ModelRoleType = "user" | "assistant" | string;

export interface ChatMessage {
  /**
   * @title 内容
   * @description 消息内容 markdown格式
   */
  content: string;
  error?: any;
  model?: string;
  /**
   * 创建者
   */
  creator?: string;
  /**
   * @title 父消息id
   * @description 消息顺序是否需要链表结果？一般情况下按照创建时间顺序即可。该字段预留，不维护
   */
  parentId?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: ModelRoleType;
  createAt: number;
  id: string;
  sessionId: string;
  updateAt?: number;
  /**
   * 额外信息 序列化
   */
  extra?: string;
}

export type AddChatMessageDto = Pick<
  ChatMessage,
  "content" | "parentId" | "creator" | "role" | "extra" | "sessionId"
>;

export type UpdateChatMessageDto = {
  id: ChatMessage["id"];
} & Partial<AddChatMessageDto>;

export interface ChatPagination {
  current: number;
  pageSize: number;
}
