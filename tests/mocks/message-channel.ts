import { MessagePort } from "./message-port"
import { Subject } from "./subject"

export class MessageChannel {
  port1: MessagePort
  port2: MessagePort

  constructor() {
    const port1 = new Subject()
    const port2 = new Subject()

    this.port1 = new MessagePort(port1,port2)
    this.port2 = new MessagePort(port2, port1)
  }
}
