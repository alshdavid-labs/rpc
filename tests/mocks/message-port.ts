import { Subject } from "./subject"

export class MessagePort {
  #myPort: Subject
  #otherPort: Subject
  #callbacks: Map<any, any>
  #startBuffer: Array<any>
  #active: boolean

  constructor(
    myPort: Subject,
    otherPort: Subject,
  ) {
    this.#myPort = myPort
    this.#otherPort = otherPort
    this.#callbacks = new Map()
    this.#startBuffer = []
    this.#active = false

  }

  postMessage(data: any): void {
    if (!this.#active) {
      this.#startBuffer.push(data)
      return
    }
    this.#myPort.next(JSON.parse(JSON.stringify({ data })))
  }

  addEventListener(_event: string, callback: any): void {
    const dispose = this.#otherPort.subscribe(callback)
    this.#callbacks.set(callback, dispose)
  }
  
  removeEventListener(_event: string, callback: any): void {
    const dispose = this.#callbacks.get(callback)
    if (dispose) {
      dispose()
    }
  }
  
  start() {
    this.#active = true
    for (const data of this.#startBuffer) {
      this.postMessage(data)
    }
  }
}
