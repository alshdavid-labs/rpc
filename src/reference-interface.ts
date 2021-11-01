type PreviousNumber = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

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

type ReferenceParams<T> = T extends (...args: infer A) => infer R
  ? (...args: { [I in keyof A]: A[I] extends object ? IReference<A[I]> : A[I]}) => R
  : T;

export interface IReference<T extends object> { 
  property<P extends Paths<T>>(...paths: [...P]): IReference<PropertyAtPath<T, P>>;

  exec(
    ...args: T extends (...args: infer A) => any
      ? { [I in keyof A]: ReferenceParams<A[I]> }
      : never
  ): T extends (...args: any) => any ? Promise<IReference<ReturnType<T>>> : any;
  value(): T extends (...args: any) => any ? any : Promise<T>;
  // set(value: T): Promise<void>;
  // delete(): Promise<void>;
  close(): void;
}
