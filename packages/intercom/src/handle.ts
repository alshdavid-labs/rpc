import { ID } from "./id"
import { Subject, firstValueFrom } from "./subject"
import { EventSenderReceiver, TargetResult, TargetArgument, EventData, TargetAction } from "./types"

export class Handle {
  private _bus: EventSenderReceiver
  private _requests = new Map<string, Subject<TargetResult>>()
  private _callbackCache = new Map<string, Function>()

  constructor(
    bus: any,
    private _path: string[] = [],
    private _ref?: string,
  ) {
    this._bus = bus
    bus.addEventListener('message', this._onMessage)
  }

  public async value<T>(): Promise<T> {
    const [ id, onResult ] = this._createId()
    const onEvent = firstValueFrom(onResult)
    this._send(id, 'value')
    const event = await onEvent
    return event.value as T
  }

  public async exec<T extends Array<any>>(...args: T): Promise<Handle> {
    const [ id, onResult ] = this._createId()
    const onEvent = firstValueFrom(onResult)

    const targetArgs: TargetArgument[] = []
    for (const arg of args) {
      if (typeof arg === 'function') {
        const callbackId = ID()
        this._callbackCache.set(callbackId, arg)
        targetArgs.push({ type: 'function', value: callbackId })
      } else {
        targetArgs.push({ type: 'basic', value: arg})
      }
    }

    this._send(id, 'exec', targetArgs)
    const event = await onEvent
    return new Handle(this._bus, [], event.value as string)
  }

  public property(name: string): Handle {
    return new Handle(this._bus, [...this._path, name], this._ref)
  }

  private _createId(): [ string, Subject<TargetResult> ] {
    const id = ID()
    const events = new Subject<TargetResult>()
    this._requests.set(id, events)
    return [ id, events]
  }

  private _onMessage = ({ data }: EventData<TargetResult>) => {
    if (data.action === 'callback' && this._callbackCache.has(data.id)) {
      const callback = this._callbackCache.get(data.id)
      callback!(...(data.value as any[] || []))
      return
    }
    if (data.action === 'result' && this._requests.has(data.id)) {
      const request = this._requests.get(data.id)
      request!.next(data)
      return
    }
  }

  private _send(id: string, action: 'exec' | 'value', args?: any[]) {
    this._bus.postMessage<TargetAction>({ id, action, path: this._path, args, ref: this._ref })
  }
}