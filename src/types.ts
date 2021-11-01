export enum CacheType {
  CallbackCache
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