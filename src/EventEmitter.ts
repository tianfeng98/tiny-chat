/**
 * 考虑多端兼容性，自行实现一个简易的事件触发器，用于处理事件监听和触发
 */

type EventHandler = (...dataList: any) => void;

export default class EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();

  public on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    const eventHandlers = this.handlers.get(eventType);
    eventHandlers?.push(handler);
  }

  public once(eventType: string, handler: EventHandler): void {
    this.on(eventType, (data) => {
      handler(data);
      this.off(eventType, handler);
    });
  }

  public off(eventType: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index !== -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }

  public emit(eventType: string, ...dataList: any): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        handler(...dataList);
      }
    }
  }
}
