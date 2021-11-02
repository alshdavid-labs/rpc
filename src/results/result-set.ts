import { ActionType } from "../actions";

export class ResultSet {
  readonly actionType: ActionType.Set
  readonly id: string

  constructor(
    id: string,
  ) {
    this.actionType = ActionType.Set
    this.id = id
  }
}
