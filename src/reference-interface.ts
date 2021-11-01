export type ReferenceParams<T> = T extends (...args: infer A) => infer R
  ? (...args: { [I in keyof A]: IReference<A[I]> }) => R
  : T;

export interface IReference<T> {
  // property<K extends keyof T | ((...args: any) => any)>(
  //   key: K
  // ): K extends keyof T ? IReference<T[K]> : any;
  // exec(
  //   ...args: T extends (...args: infer A) => any
  //     ? { [I in keyof A]: ReferenceParams<A[I]> }
  //     : never
  // ): T extends (...args: any) => any ? Promise<IReference<ReturnType<T>>> : any;
  value(): T extends (...args: any) => any ? any : Promise<T>;
  // set(value: T): Promise<void>;
  // delete(): Promise<void>;
  close(): void;
}
