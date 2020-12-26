import { Observable, Subject, firstValueFrom } from "rxjs"
import { get } from "./get"

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

export class Result<T> {
  value(): Promise<T> {}
  observe(): Observable<T> {}
  exec<U>(): Result<U> {}
}

export class Remote {
  private _requests = new Map<number, Subject<ExecutionResult<unknown>>>()

  constructor(
    private _bus: EventSenderReceiver
  ) {
    _bus.addEventListener('message', this._onMessage)
  }

  public observe<T = any>(name: any, path: string[], args: any[] = []): Observable<T> {
    return new Observable<any>(o => {
      const [id] = window.crypto.getRandomValues(new Uint32Array(1))
      const events = new Subject<ExecutionResult<unknown>>()
      this._requests.set(id, events)
      this._bus.postMessage<ExecutionEvent>({ id, name, path, args })


      events.subscribe(event => {
          o.next(event.result)
      })

      return () => {
        this._requests.delete(id)
        this._bus.postMessage<ExecutionEvent>({ id, name: id, path: [], args: [] })
        o.complete()
      }     
    })
  }

  public async exec<T = any>(name: any, path: string[], args: any[] = []): Result<T> {
    const [id] = window.crypto.getRandomValues(new Uint32Array(1))
    const events = new Subject<ExecutionResult<unknown>>()
    this._requests.set(id, events)
    this._bus.postMessage<ExecutionEvent>({ id, name, path, args })

    const event = await firstValueFrom(events)
    if (event.type === 'function') {
      return ((...args: any[]) => this.exec(id, [], args)) as any
    } 
    return event.result as any   
  }

  public async property<T = any>(name: any, path: string[]): Promise<T> {

  }

  private _onMessage = ({ data }: EventData<ExecutionResult<unknown>>) => {
    const request = this._requests.get(data.id)
    request?.next(data)
  }
} 

export class Context {
  private _provided = new Map<string, any>()
  private _results = new Map<number, any>()

  constructor(
    private _bus: EventSenderReceiver
  ) {
    _bus.addEventListener('message', this._onMessage)
  }

  public exec() {
    this._bus.postMessage({ bar: 'foo' })
  }

  public provide(key: string, service: any) {
    this._provided.set(key, service)
  }

  private _onMessage = ({ data }: EventData<ExecutionEvent>) => {
    const service = this._provided.get(data.name)
    const target = get(service, data.path, this._results.get(data.name))

    if (data.path[data.path.length - 1] === 'subscribe') {
      const parent = get(service, data.path.slice(0, data.path.length - 1), service)
      const sub = target.bind(parent)(
        (value: unknown) => {
          this._bus.postMessage<ExecutionResult<any>>({
            id: data.id,
            result: value,
            type: 'value',
          })
        })
      this._results.set(data.id, () => sub.unsubscribe())
    } else if (typeof target === 'function') {
      const parent = get(service, data.path.slice(0, data.path.length - 1), service)
      let result: any
      if (parent) {
        result = target.bind(parent)(...data.args)
      } else {
        result = target(...data.args)
      }
      if (typeof result === 'function') {
        this._results.set(data.id, result)
        this._bus.postMessage<ExecutionResult<any>>({
          id: data.id,
          result: data.id,
          type: 'function',
        })
      } else {
        if (this._results.get(data.id)) this._results.delete(data.id)
        this._bus.postMessage<ExecutionResult<any>>({
          id: data.id,
          result,
          type: 'value',
        })
      }
    } else {
      this._bus.postMessage<ExecutionResult<any>>({
        id: data.id,
        result: target,
        type: 'value',
      })
    }
  }
}