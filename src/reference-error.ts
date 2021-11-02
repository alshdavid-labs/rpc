import { IReference } from "./reference-interface"

export class ReferenceError extends Error {
  public readonly reference: IReference<unknown>

  constructor(reference: IReference<unknown>) {
    super('ReferenceError')
    this.reference = reference
  }
}