import type {
  AddChatMessageDto,
  AddChatSessionDto,
  ChatPagination,
  ChatSessionDto,
  UpdateChatMessageDto,
  UpdateChatSessionDto,
} from "../interface";
import DriverManager from "./DriverManager";
import type { ChatStorageDriver } from "./interface";

export * from "./interface";

export default class ChatStorage
  extends DriverManager
  implements Omit<ChatStorageDriver, "name">
{
  constructor() {
    super();
  }
  getChatSessions(pageParams: ChatPagination, otherParams?: any) {
    return this.getDriver().getChatSessions(pageParams, otherParams);
  }
  getChatSession(id: string) {
    return this.getDriver().getChatSession(id);
  }
  addChatSession(dto: AddChatSessionDto) {
    return this.getDriver().addChatSession(dto);
  }
  updateChatSession(dto: UpdateChatSessionDto) {
    return this.getDriver().updateChatSession(dto);
  }
  deleteChatSession(id: string) {
    return this.getDriver().deleteChatSession(id);
  }
  getChatMessages(
    sessionId: ChatSessionDto["id"],
    pageParams: ChatPagination,
    otherParams?: any
  ) {
    return this.getDriver().getChatMessages(sessionId, pageParams, otherParams);
  }
  addChatMessage(dto: AddChatMessageDto) {
    return this.getDriver().addChatMessage(dto);
  }
  updateChatMessage(dto: UpdateChatMessageDto) {
    return this.getDriver().updateChatMessage(dto);
  }
  deleteChatMessage(id: string) {
    return this.getDriver().deleteChatMessage(id);
  }
}
