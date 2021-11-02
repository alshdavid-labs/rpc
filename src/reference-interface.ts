type PreviousNumber = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Paths<Target extends object, RecursiveDepthCounter extends number = 10> =
  [RecursiveDepthCounter] extends [never]
      ? never
      : {
          [key in keyof Target]: Target[key] extends infer TargetChild
              ? TargetChild extends object
                  ? [key] | [key, ...Paths<TargetChild, PreviousNumber[RecursiveDepthCounter]>]
                  : [key]
              : [key]
      }[keyof Target];

type PropertyAtPath<Target extends unknown, Path extends readonly unknown[]> =
  Path extends [] 
      ? Target
      : Path extends [infer TargetPath, ...infer RemainingPaths]
          ? TargetPath extends keyof Target 
              ? PropertyAtPath<Target[TargetPath], RemainingPaths>
              : never
          : never;

export interface IReferenceObject<T extends object> {
  property<P extends Paths<T>>(...paths: [...P]): IReferenceObject<PropertyAtPath<T, P>>
  set(value: T): Promise<void>
  value(): T extends (...args: any[]) => any ? never : Promise<T>
}

export interface IReferenceBasic<T> {
  value(): Promise<T>
}

export interface IReferenceFunction<T extends (...args: any[]) => any> {
  exec(
    ...args: T extends (...args: infer Args) => any ? 
      { 
        [I in keyof Args]: Args[I] extends (...args: infer CallbackArgs) => infer CallbackReturnType
          ? (...args: { [I2 in keyof CallbackArgs]: IReference<CallbackArgs[I2]> }) => CallbackReturnType
          : Args[I]
      } : 
      never
  ): Promise<IReference<ReturnType<T>> & { release(): void }>
  release(): void
}

export type IReference<T> = (
  T extends (...args: any[]) => any ? IReferenceFunction<T> :
  T extends object ? IReferenceObject<T> :
  IReferenceBasic<T>
)

export interface IReferenceError extends Error {
  reference: IReference<Error>
} 
