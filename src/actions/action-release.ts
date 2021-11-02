import { ActionType } from "./action-type"
import { createId } from "../utils"

export class ActionRelease {
  readonly actionType: ActionType.Release
  readonly id: string
  readonly data: string

  constructor(
    data: string,
  ) {
    this.actionType = ActionType.Release
    this.id = createId()
    this.data = data
  }
}
