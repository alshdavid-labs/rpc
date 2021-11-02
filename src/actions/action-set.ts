import { ActionType } from "./action-type"
import { createId } from "../utils"

export class ActionSet {
  readonly actionType: ActionType.Set
  readonly id: string
  readonly path: Array<string>
  readonly data: unknown
  readonly cacheKey: string | undefined

  constructor(
    path: Array<string>,
    data: unknown,
    cacheKey: string | undefined,
  ) {
    this.actionType = ActionType.Set
    this.id = createId()
    this.path = path
    this.data = data
    this.cacheKey = cacheKey
  }
}
