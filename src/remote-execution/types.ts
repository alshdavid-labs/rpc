export type EventData<T> = {
  data: T
}

export interface EventSenderReceiver {
  addEventListener<T>(eventName: string, action: (eventData: EventData<T>) => any): void
  removeEventListener<T>(eventName: string, action: (eventData: EventData<T>) => any): void
  postMessage<T>(eventData: T): void
}

export type ExecutionEvent = {
  id: number
  name: any
  path: string[]
  args: any[]
}

export type ExecutionResult<T> = {
  id: number
  result: T
  type: 'function' | 'value'
}