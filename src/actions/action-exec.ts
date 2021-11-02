import { ActionType } from "./action-type"
import { createId } from "../utils"

export enum ValueType {
  FunctionReference,
  Reference,
  Direct,
}

export class ExecArgument {
  readonly valueType: ValueType
  readonly value: any
  readonly id: string

  constructor(
    value: any,
    valueType: ValueType = ValueType.Direct,
  ) {
    this.valueType = valueType
    this.id = createId()
    this.value = value
  }
}

export class ActionExec {
  readonly actionType: ActionType.Exec
  readonly id: string
  readonly path: Array<string>
  readonly execArgs: Array<ExecArgument>
  readonly cacheKey: string | undefined

  constructor(
    path: Array<string>,
    execArgs: Array<ExecArgument> = [],
    cacheKey: string | undefined = undefined,
  ) {
    this.actionType = ActionType.Exec
    this.id = createId()
    this.path = path
    this.execArgs = execArgs
    this.cacheKey = cacheKey
  }
}
