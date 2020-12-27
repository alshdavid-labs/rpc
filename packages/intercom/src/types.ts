export type EventData<T> = {
  data: T
}

export interface EventSenderReceiver {
  addEventListener<T>(eventName: string, action: (eventData: EventData<T>) => any): void
  removeEventListener<T>(eventName: string, action: (eventData: EventData<T>) => any): void
  postMessage<T>(eventData: T): void
}

export type TargetArgument = { 
  type: 'basic' | 'function'
  value: any
}

export type TargetAction = {
  id: string
  action: 'exec' | 'value'
  path: string[]
  ref?: string
  args?: TargetArgument[]
}

export type TargetResult = {
  id: string
  value: unknown
  action: 'result' | 'callback'
}