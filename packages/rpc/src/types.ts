export enum CacheType {
  CallbackCache
}

export type EventData<T> = {
  data: T;
};

export type ActionFunc<T> = (eventData: EventData<T>) => any;

export interface ITarget {
  addEventListener<T>(eventName: 'message', action: ActionFunc<T>): void;
  removeEventListener<T>(eventName: 'message', action: ActionFunc<T>): void;
  postMessage<T>(eventData: T): void;
}

export type TargetArgument = {
  type: 'basic' | 'function';
  value: any;
};

export type TargetAction = {
  id: string;
  action: 'exec' | 'value' | 'dispose' | 'set' | 'delete';
  path: Array<string>;
  ref?: string;
  args?: Array<TargetArgument>;
};

export type TargetResult = {
  id: string;
  value: unknown;
  action: 'result' | 'callback' | 'exception';
};
