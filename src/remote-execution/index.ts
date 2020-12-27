import { firstValueFrom, Subject } from "rxjs";
import { get } from "./get";
import { EventData, EventSenderReceiver } from "./types";

const ID = (): string => {
  const [id] = crypto.getRandomValues(new Uint32Array(1))
  return id.toString()
}

type TargetArgument = { 
  type: 'basic' | 'function'
  value: any
}

type TargetAction = {
  id: string
  action: 'exec' | 'value'
  path: string[]
  ref?: string
  args?: TargetArgument[]
}

type TargetResult = {
  id: string
  value: unknown
}
export class Receiver {
  private _bus: EventSenderReceiver
  private _refCache = new Map<string, any>()

  constructor(
    bus: any,
    private _target: any,
  ) {
    this._bus = bus
    bus.addEventListener('message', this._onMessage)
  }

  private _onMessage = ({ data }: EventData<TargetAction>) => {
    if (data.action === 'value') this._sendValue(data)
    if (data.action === 'exec') this._sendRef(data)
  }

  private _sendValue({ id, path, ref }: TargetAction) {
    const [ value ] = this._getProperty(path!, ref)
    this._bus.postMessage<TargetResult>({ id, value })
  }

  private _sendRef({ id, path, args = [], ref }: TargetAction) {
    const [ prop, parent ] = this._getProperty(path!, ref)
    let fn: Function = prop
    if (parent) {
      fn = prop.bind(parent)
    }
    const result = fn(...args)
    const refPath = ID()
    this._refCache.set(refPath, result)
    this._bus.postMessage<TargetResult>({ id, value: refPath })
  }

  private _getProperty(path: string[], ref?: string): [any, any | undefined] {
    let source: any
    if (ref) {
      source = this._refCache.get(ref)
    } else {
      source = this._target
    }
    if (path.length === 0) {
      return [ source, undefined ]
    }
    const value = get(source, path)
    const parent = get(source, path.slice(0, path.length - 1), source)
    return [ value, parent ]
  }
}


export class Handle {
  private _bus: EventSenderReceiver
  private _requests = new Map<string, Subject<TargetResult>>()

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
    this._send(id, 'exec', args)
    const event = await onEvent
    return new Handle(this._bus, [], event.value as string)
  }

  public property(name: string): Handle {
    return new Handle(this._bus, [...this._path, name], this._ref)
  }

  // public method(): Handle {
    
  // }

  private _createId(): [ string, Subject<TargetResult> ] {
    const id = ID()
    const events = new Subject<TargetResult>()
    this._requests.set(id, events)
    return [ id, events]
  }

  private _onMessage = ({ data }: EventData<TargetResult>) => {
    const request = this._requests.get(data.id)
    request?.next(data)
  }

  private _send(id: string, action: 'exec' | 'value', args?: any[]) {
    this._bus.postMessage<TargetAction>({ id, action, path: this._path, args, ref: this._ref })
  }
}