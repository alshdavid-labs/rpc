import { Action, ActionExec, ActionRelease, ActionSet, ActionType, ActionValue, ExecArgument, ValueType } from "./actions"
import { IMessagePort, EventData } from "./messages"
import { Result, ResultExec, ResultSet, ResultValue, } from "./results"
import { get, set } from 'lodash'
import { ResultRelease } from "./results/result-release"

export interface IDataSource {
  close(): void
}
let c = 0
export class DataSource implements IDataSource {
  #data: any
  #messagePort: IMessagePort
  #valueCache: Map<string, any>

  constructor(
    data: any,
    messagePort: IMessagePort
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
    if (action.path.length) {
      value = get(source, action.path)
    } else {
      value = source
    }
    
    return new ResultValue(action.id, value)
  }

  #onSetRequest(action: ActionSet): ResultSet {
    set(this.#data, action.path, action.data)
    return new ResultSet(action.id)
  }

  async #onExecRequest(action: ActionExec): Promise<ResultExec> {
    let target = this.#data
    let cachedParams: string[] = []

    if (action.cacheKey) {
      target = this.#valueCache.get(action.cacheKey)
    }

    if (action.path.length) {
      target = get(target, action.path)
    }

    const args: any[] = []
    for (const execArg of action.execArgs) {
      if (execArg.valueType === ValueType.Direct) {
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