import { ActionType } from "./action-type"
import { createId } from "../utils"

export class ActionValue {
  readonly actionType: ActionType.Value
  readonly id: string
  readonly path: Array<string>
  readonly cacheKey: string | undefined

  constructor(
    path: Array<string>,
    cacheKey: string | undefined,
  ) {
    this.actionType = ActionType.Value
    this.id = createId()
    this.path = path
    this.cacheKey = cacheKey
  }
}
