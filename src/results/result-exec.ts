import { ActionType } from "../actions";

export class ResultExec {
  readonly actionType: ActionType.Exec
  readonly id: string
  readonly cachedParams: string[]
  readonly returnReference: string
  readonly hasThrown: boolean

  constructor(
    id: string,
    cachedParams: string[] = [],
    hasThrown: boolean = false,
  ) {
    this.actionType = ActionType.Exec
    this.id = id
    this.cachedParams = cachedParams
    this.returnReference = id
    this.hasThrown = hasThrown
  }
}
