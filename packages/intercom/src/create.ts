import { Handle } from "./handle"
import { Receiver } from "./receiver"

export interface IHandle<T> {
  property<K extends (keyof T) | ((...args: any) => any)>(key: K): K extends keyof T ? IHandle<T[K]> : any
  exec(...args: T extends (...args: any) => any ? Parameters<T> : any): T extends (...args: any) => any ? Promise<IHandle<ReturnType<T>>> : any
  value(): T extends (...args: any) => any ? any : Promise<T>
}

export interface IReceiver {}

export const createHandle = <T = any>(worker: any): IHandle<T> => new Handle(worker) as any
export const createReceiver = (source: any): IReceiver => new Receiver(self as any, source) as any
