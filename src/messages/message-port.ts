export type EventData<T> = {
  data: T;
};

export type ActionFunc<T> = (eventData: EventData<T>) => any;

export interface IMessagePort {
  addEventListener<T>(eventName: 'message', action: ActionFunc<T>): void;
  removeEventListener<T>(eventName: 'message', action: ActionFunc<T>): void;
  postMessage<T>(eventData: T): void;
}