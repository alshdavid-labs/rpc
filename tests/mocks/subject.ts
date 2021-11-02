export class Subject<T = any> {
  #callbacks: Map<(value: T) => any, (value: T) => any>

  constructor() {
    this.#callbacks = new Map()
  }

  subscribe(callback: (value: T) => any) {
    this.#callbacks.set(callback, callback)
    return () => this.#callbacks.delete(callback)
  }

  next(value: T) {
    for (const callback of this.#callbacks.values()) {
      callback(value)
    }
  }
}
