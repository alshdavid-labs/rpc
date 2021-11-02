import { ActionType } from "../actions";

export class ResultValue {
  readonly actionType: ActionType.Value
  readonly id: string
  readonly value: unknown

  constructor(
    id: string,
    value: unknown,
  ) {
    this.actionType = ActionType.Value
    this.id = id
    this.value = value
  }
}
