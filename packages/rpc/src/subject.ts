export type Callback<T extends Array<any> = [], U = void> = (...args: T) => U 

export class Subject<T> {
  private _subscribers = new Map<Object, Callback<[T], any>>()
  private _isComplete = false

  subscribe(
    value: Callback<[T], any>,
  ): () => void {
    const key = {}
    this._subscribers.set(key, value)
    return () => this._subscribers.delete(key)
  }

  next(value: T): void {
    if (!this._isComplete) {
      for(const cb of this._subscribers.values()) cb(value)
    }
  }

  complete(): void {
    this._subscribers.clear()
    this._isComplete = true
  }
}

export const firstValueFrom = <T>(source: Subject<T>): Promise<T> => 
  new Promise(res => {
    const dispose = source.subscribe(
      value => {
        dispose()
        res(value)
      }
    )
  })