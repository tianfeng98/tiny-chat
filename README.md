# tiny-chat

[![NPM version](https://img.shields.io/npm/v/tiny-chat-core.svg?style=flat)](https://npmjs.com/package/tiny-chat-core)
[![NPM downloads](http://img.shields.io/npm/dm/tiny-chat-core.svg?style=flat)](https://npmjs.com/package/tiny-chat-core)

<div align="center">

## 一个用于对话组件开发的核心逻辑，适配多端。

</div>

`Tiny Chat` 实现了一套通用的 API 用于对话逻辑和存储管理，适用于多种聊天组件和存储端点。但它不包含消息的发送和响应，你可以根据你的需要使用`ajax`、`SSE`、`websocket`等自行实现。

## Install

```bash
$ npm install tiny-chat-core
```

or

```bash
$ pnpm add tiny-chat-core
```

## Usage

```typescript
import TinyChat from "tiny-chat-core";

const tinyChat = new TinyChat({
  sortDirection: {
    chatSessions: "descend",
    chatMessages: "descend",
  },
});

// 定义存储驱动
tinyChat.defineDriver(ChatStorageDriver);

// 指定存储驱动
tinyChat.config({
  name: "remote",
});

// 分页加载会话列表
tinyChat.getChatSessions({
  current: 1,
  pageSize: 10,
});

// 更新会话
tinyChat.updateChatSession({
  id: "sessionId",
  // 更新参数
});

// 获取会话
const chatSession = tinyChat.getChatSession("sessionId");

// 加载消息
tinyChat.getChatMessagess("sessionId", {
  // 分页参数
});

// 添加会话
const chatSession = await tinyChat.addChatSession({
  // 会话参数
});

// 发送消息
chatSession.sendMessage("Hello, World!");
```

## Inteface

### 构造函数参数

```typescript
interface TinyChatOptions {
  sortDirection?: {
    chatSessions?: "ascend" | "descend";
    chatMessages?: "ascend" | "descend";
  };
}
```

### 存储驱动配置

```typescript
interface ChatStorageDriver {
  /**
   * 存储驱动唯一标识
   */
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
  addChatMessage: (dto: AddChatMessageDto) => Promise<boolean>;
  updateChatMessage: (dto: UpdateChatMessageDto) => Promise<boolean>;
  deleteChatMessage: (id: string) => Promise<boolean>;
}
```

### 会话

```typescript
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
```

### 消息

```typescript
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
   * @title 角色
   * @description 消息发送者的角色
   */
  role: ModelRoleType;
  createAt: number;
  id: string;
  sessionId: string;
  updateAt?: number;
  /**
   * @title 额外信息
   * @description 序列化保存
   */
  extra?: string;
}
```

### 分页参数

```typescript
interface ChatPagination {
  current: number;
  pageSize: number;
}
```

## API

### `tinyChat.config(config: DriverConfig): void`

```typescript
interface DriverConfig {
  name: string;
}
```

配置存储驱动

### `tinyChat.defineDriver(driver: ChatStorageDriver): void`

自定义存储驱动

### `tinyChat.getChatSession(sessionId: string): ChatSession | und`

根据 id 获取会话

### `tinyChat.getChatSessions(sortDirection: "ascend" | "descend")`

获取已载入的会话列表

### `tinyChat.loadChatSession(sessionId: string): Promise<ChatSession | null>`

根据 id 从存储器中载入会话

### `tinyChat.loadChatSessions(pageParams: ChatPagination, otherParams?: any): Promise<ChatSession[]>`

从存储器中载入会话列表

### `tinyChat.addChatSession(dto: AddChatSessionDto): Promise<ChatSession | null>`

创建并保存会话到存储器

### `tinyChat.updateChatSession(dto: UpdateChatSessionDto): Promise<ChatSession | null>`

修改会话（包括存储器）

### `tinyChat.deleteChatSession(sessionId: string): Promise<boolean>`

删除会话（包括存储器）

### `tinyChat.loadChatMessagess( sessionId: string,pageParams: ChatPagination,otherParams?: any): Promise<ChatMessage[]>`

载入指定会话中的消息

### `chatSession.getData(): ChatSessionDto`

获取会话数据对象

### `chatSession.generateBaseMessage(content: string, role: ModelRoleType): ChatMessage`

消息内容和角色生成消息对象

### `chatSession.addTempMessage(message: ChatMessage): ChatMessage`

创建临时消息，不会写入存储

### `chatSession.updateTempMessage(messageId: string, message: Partial<ChatMessage>): Promise<ChatMessage | null>`

更新临时消息

### `chatSession.getMessage(messageId: string): ChatMessage | null`

获取指定 id 的消息（已载入的）

### `chatSession.getMessages(sortDirection: "ascend" | "descend"): ChatMessage[]`

获取已载入的消息列表

### `chatSession.updateSession(dto: Pick<ChatSessionDto, "title" | "updateAt"> & { extra?: any }): Promise<boolean>`

更新会话信息到存储器

### `chatSession.loadChatMessages(pageParams: ChatPagination, otherParams?: any): Promise<ChatMessage[]>`

从存储器中载入消息列表

### `chatSession.deleteMessage(messageId: string): Promise<boolean>`

删除消息

### `chatSession.updateMessage(messageId: string, message: Partial<ChatMessage>): Promise<boolean>`

修改消息

### `chatSession.sendMessage(content: string): Promise<ChatMessage | null>`

用户发送消息

### `chatSession.receiveAssistantMessage(content: string): Promise<ChatMessage | null>`

收到助手消息

### `chatSession.receiveMessage(content: string, role: string): Promise<ChatMessage | null>`

收到消息

## Event

### `change:chatSessions`

会话列表发生变化时触发

示例：

```typescript
tinyChat.on("change:chatSessions", (chatSessionDtos) => {
  console.log(chatSessionDtos);
});
```

### `change:chatMessages`

消息列表发生变化时触发

示例：

```typescript
tinyChat.on("change:chatMessages", (sessionId, chatMessages) => {
  console.log(sessionId, chatMessages);
});
```

## LICENSE

MIT License

Copyright (c) 2024 听风

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
