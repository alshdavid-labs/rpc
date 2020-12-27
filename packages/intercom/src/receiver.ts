import { get } from "./get"
import { ID } from "./id"
import { EventSenderReceiver, EventData, TargetAction, TargetResult } from "./types"

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
    const value = this._getProperty(path!, ref)
    this._bus.postMessage<TargetResult>({ id, value, action: 'result' })
  }

  private _sendRef({ id, path, args = [], ref }: TargetAction) {
    const func = this._getProperty(path!, ref)

    const releasedArgs: any[] = []
    for (const arg of args) {
      if (arg.type === 'basic') {
        releasedArgs.push(arg.value)
        continue
      }
      if (arg.type === 'function') {
        releasedArgs.push((...args: any[]) => {
          this._bus.postMessage<TargetResult>({ id: arg.value, value: args, action: 'callback' })
        })
        continue
      }
    }

    const result = func(...releasedArgs)
    const refPath = ID()
    this._refCache.set(refPath, result)
    this._bus.postMessage<TargetResult>({ id, value: refPath, action: 'result' })
  }

  private _getProperty(path: string[], ref?: string): Function {
    let source: any
    if (ref) {
      source = this._refCache.get(ref)
    } else {
      source = this._target
    }
    if (path.length === 0) {
      return source
    }
    const value = get(source, path)
    if (typeof value === 'function') {
      let parent: any = source
      if (path.length > 1) {
        parent = get(source, path.slice(0, path.length - 1))
      }
      const key = path.slice(-1)[0] 
      return (...args: any[]) => parent[key](...args) 
    } else {
      return value
    }
  }
}