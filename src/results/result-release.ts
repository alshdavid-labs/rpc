import { ActionType } from "../actions";

export class ResultRelease {
  readonly actionType: ActionType.Release
  readonly id: string

  constructor(
    id: string,
  ) {
    this.actionType = ActionType.Release
    this.id = id
  }
}
