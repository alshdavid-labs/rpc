export type Callback<T extends Array<any> = [], U = void> = (...args: T) => U 

export class Subject<T> {
  private _subscribers = new Map<Object, Callback<[T], any>>()

  subscribe(
    value: Callback<[T], any>,
  ) {
    const key = {}
    this._subscribers.set(key, value)
    return () => this._subscribers.delete(key)
  }

  next(value: T) {
    for(const cb of this._subscribers.values()) cb(value)
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