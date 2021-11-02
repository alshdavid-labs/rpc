import { Action, ActionExec, ActionRelease, ActionSet, ActionType, ActionValue, ExecArgument, RemoteReference, ValueType } from "./actions"
import { IMessagePort, EventData } from "./messages"
import { Result, ResultExec, ResultSet, ResultValue, } from "./results"
import { get, set } from './utils'
import { ResultRelease } from "./results/result-release"

export interface IDataSource {
  close(): void
}

export class DataSource implements IDataSource {
  #data: any
  #messagePort: IMessagePort
  #valueCache: Map<string, any>

  constructor(
    messagePort: IMessagePort,
    data: any,
  ) {
    this.#data = data
    this.#valueCache = new Map()
    this.#messagePort = messagePort
    this.#messagePort.addEventListener<Action>('message', this.#onMessage)
  }

  close(): void {
    this.#messagePort.removeEventListener<Action>('message', this.#onMessage)
  }

  #onMessage = async ({ data: action }: EventData<Action>) => {
    let result: Result
    
    if (action.actionType === ActionType.Value) {
      result = this.#onValueRequest(action)
    } else if (action.actionType === ActionType.Set) {
      result = this.#onSetRequest(action)
    } else if (action.actionType === ActionType.Exec) {
      result = await this.#onExecRequest(action)
    } else if (action.actionType === ActionType.Release) {
      result = this.#onReleaseRequest(action)
    } else {
      return
    }
    
    this.#messagePort.postMessage<Result>(result)
  }

  #onValueRequest(action: ActionValue): ResultValue {
    let source = this.#data
    let value = source

    if (action.cacheKey) {
      source = this.#valueCache.get(action.cacheKey)
    }

    value = getProperty(source, action.path)   
    return new ResultValue(action.id, value)
  }

  #getSource(action: { cacheKey: string | undefined }) {
    let target = this.#data
    if (action.cacheKey) {
      target = this.#valueCache.get(action.cacheKey)
    }
    return target
  }

  #onSetRequest(action: ActionSet): ResultSet {
    const target = this.#getSource(action)
    set(target, action.path, action.data)
    return new ResultSet(action.id)
  }

  async #onExecRequest(action: ActionExec): Promise<ResultExec> {
    const source = this.#getSource(action)
    const target = getProperty(source, action.path)
    const cachedParams: string[] = []

    const args: any[] = []
    for (const execArg of action.execArgs) {
      if (execArg.valueType === ValueType.RemoteReference) {
        const { path }: RemoteReference = execArg.value
        const  source = this.#getSource(execArg.value)
        args.push(getProperty(source, path))
      } else if (execArg.valueType === ValueType.Direct) {
        args.push(execArg.value)
      } else if (execArg.valueType === ValueType.FunctionReference) {
        const proxyFn = (...proxyArgs: any[]) => this.#triggerRemoteFunction(execArg.id, proxyArgs)
        this.#valueCache.set(execArg.id, proxyFn)
        cachedParams.push(execArg.id)
        args.push(proxyFn)
      }
    }

    try {
      const returnValue = await target(...args)
      if (returnValue !== undefined) {
        this.#valueCache.set(action.id, returnValue)
      }
      return new ResultExec(action.id, cachedParams)
    } catch (error) {
      this.#valueCache.set(action.id, error)
      return new ResultExec(action.id, cachedParams, true)
    }
  }

  #onReleaseRequest(action: ActionRelease): ResultRelease {
    this.#valueCache.delete(action.data)
    return new ResultRelease(action.id)
  }

  #triggerRemoteFunction(id: string, args: any[]) {
    const execArgs: ExecArgument[] = []
    for (const arg of args) {
      const execArg = new ExecArgument(null, ValueType.Reference)
      this.#valueCache.set(execArg.id, arg)
      execArgs.push(execArg)
    }
    this.#messagePort.postMessage<ActionExec>(new ActionExec([], execArgs, id))
  }
}

function getProperty(source: any, path: string[]) {
  let result: any = source
  
  if (path.length) {
    result = get(source, path)
  }

  if (typeof result === 'function' && path.length) {
    let context = source
    if (path.length > 1) {
      context = get(source, path.splice(0, path.length - 1))
    }
    const fn = result
    result = (...args: any[]) => fn.call(context, ...args)
  }

  return result
}
