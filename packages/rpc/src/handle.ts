import { ErrorHandle } from './error-handle';
import { ID } from './id';
import { Subject, firstValueFrom } from './subject';
import { TargetResult, TargetArgument, EventData, TargetAction, ITarget } from './types';

type HandlifyParams<T> = T extends (...args: infer A) => infer R
  ? (...args: { [I in keyof A]: IHandle<A[I]> }) => R
  : T;
export interface IHandle<T> {
  property<K extends keyof T | ((...args: any) => any)>(key: K): K extends keyof T ? IHandle<T[K]> : any;
  exec(
    ...args: T extends (...args: infer A) => any
      ? {
          [I in keyof A]: HandlifyParams<A[I]>;
        }
      : never
  ): T extends (...args: any) => any ? Promise<IHandle<ReturnType<T>>> : any;
  value(): T extends (...args: any) => any ? any : Promise<T>;
  set(value: T): Promise<void>
  delete(): Promise<void>
  dispose(): Promise<void>;
}

export class Handle implements IHandle<any> {
  private _requests = new Map<string, Subject<TargetResult>>();

  constructor(
    private _target: ITarget,
    private _path: Array<string>,
    private _ref: string,
    // tslint:disable:ban-types
    private _callbackCache: Map<string, Function>,
  ) {}

  public async value(): Promise<any> {
    this._addEventListener();
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    this._send(id, 'value');
    const event = await onEvent;
    this._removeEventListener();
    return event!.value;
  }

  public async set(value: any): Promise<void> {
    this._addEventListener();
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    this._send(id, 'set', [value]);
    await onEvent;
    this._removeEventListener();
  }

  public async delete(): Promise<void> {
    this._addEventListener();
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    this._send(id, 'delete');
    await onEvent;
    this._removeEventListener();
  }

  public async exec(...args: Array<any>): Promise<Handle> {
    this._addEventListener();
    let hasFunction = false;
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);

    const targetArgs: Array<TargetArgument> = [];

    for (const arg of args) {
      if (typeof arg === 'function') {
        let callbackId: string = '';

        for (const [key, fn] of this._callbackCache.entries()) {
          if (fn === arg) {
            callbackId = key;
          }
        }

        if (!callbackId) {
          callbackId = ID();
          this._callbackCache.set(callbackId, arg);
        }

        targetArgs.push({ type: 'function', value: callbackId });
        hasFunction = true;
      } else {
        targetArgs.push({ type: 'basic', value: arg });
      }
    }

    this._send(id, 'exec', targetArgs);
    const event = (await onEvent)!;
    if (!hasFunction) {
      this._removeEventListener();
    }
    if (event.action === 'exception') {
      throw new ErrorHandle(new Handle(this._target, [], event.value as string, this._callbackCache))
    }
    return new Handle(this._target, [], event.value as string, this._callbackCache);
  }

  public property(name: any): any {
    return new Handle(this._target, [...this._path, name], this._ref, this._callbackCache);
  }

  public async dispose() {
    const clean = [
      { type: 'basic', value: this._ref }
    ]

    for (const callbackId of this._callbackCache.keys()) {
      clean.push({ type: 'basic', value: callbackId })
      this._callbackCache.delete(callbackId);
    }

    this._addEventListener();
    const [requestId, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    this._send(requestId, 'dispose', clean);
    await onEvent;
    this._removeEventListener();
  }

  private _addEventListener() {
    this._target.addEventListener('message', this._onMessage);
  }

  private _removeEventListener() {
    this._target.removeEventListener('message', this._onMessage);
  }

  private _createId(): [string, Subject<TargetResult>] {
    const id = ID();
    const events = new Subject<TargetResult>();
    this._requests.set(id, events);
    return [id, events];
  }

  private _onMessage = ({ data }: EventData<TargetResult>) => {
    const { action, id, value } = data
    if (action === 'callback' && this._callbackCache.has(id)) {
      const callback = this._callbackCache.get(id);
      if (!callback) {
        return;
      }
      const params: Array<IHandle<unknown>> = [];
      const [fnId, paramsLength] = value as [string, number];

      for (let i = 0; i < paramsLength; i++) {
        params.push(new Handle(this._target, [i.toString()], fnId, this._callbackCache));
      }

      callback(...(params || []));
      return;
    }
    if ((action === 'result' || action === 'exception') && this._requests.has(id)) {
      const request = (this._requests.get(id))!;
      request.next(data);
      request.complete();
      this._requests.delete(id);
      return;
    }
  };

  private _send(id: string, action: 'exec' | 'dispose' | 'value' | 'set' | 'delete', args?: Array<any>) {
    this._target.postMessage<TargetAction>({ id, action, path: this._path, args, ref: this._ref });
  }
}
