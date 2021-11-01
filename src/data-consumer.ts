import { IMessagePort } from "./message-port"
import { IReference } from "./reference-interface"

export class DataConsumer<T> implements IReference<T> {
  #messagePort: IMessagePort

  constructor(
    messagePort: IMessagePort
  ) {
    this.#messagePort = messagePort
  }

  value: IReference<T>['value'] = () => {
    return Promise.resolve<any>({})
  }

  close: IReference<T>['close'] = () => {}
}