import { IDataSource } from "./data-source-interface"
import { IMessagePort } from "./message-port"

export class DataSource implements IDataSource {
  #data: unknown
  #messagePort: IMessagePort

  constructor(
    data: any,
    messagePort: IMessagePort
  ) {
    this.#data = data
    this.#messagePort = messagePort
  }

  close(): void {}
}