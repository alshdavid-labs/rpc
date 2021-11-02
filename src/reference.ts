import { IReference } from "./reference-interface"
import { Action, ActionExec, ActionRelease, ActionSet, ActionType, ActionValue, ExecArgument, ValueType } from "./actions"
import { sendAction } from "./messages"
import { EventData, IMessagePort } from "./messages/message-port"
import { ResultExec, ResultSet, ResultValue, ResultRelease } from "./results"
import { ReferenceError } from "./reference-error"

class Reference {
  #messagePort: IMessagePort
  #path: Array<string>
  #cacheKey: string | undefined
  #remoteCachedArgs: string[]
  #isListening: boolean
  #parameterCache: Map<string, any>

  constructor(
    messagePort: IMessagePort,
    path: Array<string> = [],
    cacheKey: string | undefined = undefined,
  ) {
    this.#messagePort = messagePort
    this.#parameterCache = new Map()
    this.#path = path
    this.#cacheKey = cacheKey
    this.#remoteCachedArgs = []
    this.#isListening = false
  }

  property(...segments: string[]) {
    return new Reference(this.#messagePort, segments, this.#cacheKey)
  }

  async value() {
    const action = new ActionValue(this.#path, this.#cacheKey)
    const result = await sendAction<ResultValue>(this.#messagePort, action)
    return result.value
  }

  async set(value: any) {
    const action = new ActionSet(this.#path, value)
    await sendAction<ResultSet>(this.#messagePort, action)
  }

  async exec(...args: any[]) {
    const execArgs: ExecArgument[] = []
    for (const arg of args) {
      let execArg: ExecArgument
      if (typeof arg === 'function') {
        this.#listenForCallback()
        execArg = new ExecArgument(null, ValueType.FunctionReference)
        this.#parameterCache.set(execArg.id, arg)
      } else {
        execArg = new ExecArgument(arg, ValueType.Direct)
      }
      execArgs.push(execArg)
    }
    for (const execArg of execArgs) {
      if (execArg.valueType === ValueType.FunctionReference) {
        
      }
    }
    const action = new ActionExec(this.#path, execArgs)
    const result = await sendAction<ResultExec>(this.#messagePort, action)
    const ref = new Reference(this.#messagePort, [], action.id)
    if (result.hasThrown) {
      throw new ReferenceError(ref)
    }
    return ref
  }

  async release() {
    if (this.#isListening) {
      this.#messagePort.removeEventListener('message', this.#onMessage)
    }
    if (this.#parameterCache.size) {
      this.#parameterCache.clear()
    }
    if (this.#cacheKey) {
      const action = new ActionRelease(this.#cacheKey)
      await sendAction<ResultRelease>(this.#messagePort, action)
    }
  }

  #listenForCallback() {
    if (!this.#isListening) {
      this.#isListening = true
      this.#messagePort.addEventListener('message', this.#onMessage)
    }
  }

  #onMessage = ({ data: action }: EventData<Action>) => {
    if (action.actionType === ActionType.Exec && action.cacheKey) {
      const args: any[] = []
      for (const execArg of action.execArgs) {
        args.push(execArg.value)
      }
      const target = this.#parameterCache.get(action.cacheKey)
      target(...args)
    }
  }
}

type RC = new <T>(...args: ConstructorParameters<typeof Reference>) => IReference<T>
const R: RC = Reference as any
export { R as Reference }