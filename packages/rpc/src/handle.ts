import { ID } from './id';
import { Subject, firstValueFrom } from './subject';
import { TargetResult, TargetArgument, EventData, TargetAction, ITarget } from './types';

export interface IHandle<T> {
  property<K extends keyof T | ((...args: any) => any)>(key: K): K extends keyof T ? IHandle<T[K]> : any;
  exec(
    ...args: T extends (...args: any) => any ? Parameters<T> : any
  ): T extends (...args: any) => any ? Promise<IHandle<ReturnType<T>>> : any;
  promise(): T extends (...args: any) => any ? any : Promise<T>;
  value(): T extends (...args: any) => any ? any : Promise<T>;
  dispose(): void;
}

export class Handle implements IHandle<any> {
  private _requests = new Map<string, Subject<TargetResult>>();
  // tslint:disable:ban-types
  private _callbackCache = new Map<string, Function>();

  constructor(
    private _target: ITarget,
    private _path: Array<string> = [],
    private _ref?: string,
    // tslint:disable:no-empty
    private _dispose: () => any = () => {},
  ) {}

  public async value(): Promise<any> {
    this._addEventListener();
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    this._send(id, 'value');
    const event = await onEvent;
    this._removeEventListener();
    return event.value;
  }

  public async promise(): Promise<any> {
    this._addEventListener();
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    this._send(id, 'promise');
    const event = await onEvent;
    this._removeEventListener();
    return event.value;
  }

  public async exec(...args: any[]): Promise<Handle> {
    this._addEventListener();
    let hasFunction = false;
    const [id, onResult] = this._createId();
    const onEvent = firstValueFrom(onResult);
    // tslint:disable:no-empty
    let dispose: () => any = () => {};

    const targetArgs: Array<TargetArgument> = [];
    for (const arg of args) {
      if (typeof arg === 'function') {
        const callbackId = ID();
        this._callbackCache.set(callbackId, arg);
        dispose = () => this._callbackCache.delete(callbackId);
        targetArgs.push({ type: 'function', value: callbackId });
        hasFunction = true;
      } else {
        targetArgs.push({ type: 'basic', value: arg });
      }
    }

    this._send(id, 'exec', targetArgs);
    const event = await onEvent;
    if (!hasFunction) {
      this._removeEventListener();
    }
    return new Handle(this._target, [], event.value as string, dispose);
  }

  public property(name: any): any {
    return new Handle(this._target, [...this._path, name], this._ref);
  }

  public dispose() {
    this._dispose();
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
    if (data.action === 'callback' && this._callbackCache.has(data.id)) {
      const callback = this._callbackCache.get(data.id);
      callback!(...((data.value as Array<any>) || []));
      return;
    }
    if (data.action === 'result' && this._requests.has(data.id)) {
      const request = this._requests.get(data.id);
      request!.next(data);
      return;
    }
  };

  private _send(id: string, action: 'exec' | 'promise' | 'value', args?: Array<any>) {
    this._target.postMessage<TargetAction>({ id, action, path: this._path, args, ref: this._ref });
  }
}
