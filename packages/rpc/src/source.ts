import { get } from './get';
import { ID } from './id';
import { ITarget, EventData, TargetAction, TargetResult } from './types';

export interface ISource {
  destroy(): void;
}

export class Source implements Source {
  private _refCache = new Map<string, any>();
  // tslint:disable:ban-types
  private _callbackCache = new Map<string, Function>();

  constructor(private _target: ITarget, private _data: any) {
    _target.addEventListener('message', this._onMessage);
  }

  public destroy() {
    this._target.removeEventListener('message', this._onMessage);
    this._callbackCache.clear();
  }

  private _onMessage = ({ data }: EventData<TargetAction>) => {
    if (data.action === 'value') this._sendValue(data);
    if (data.action === 'set') this._setValue(data);
    if (data.action === 'delete') this._deleteValue(data);
    if (data.action === 'exec') this._sendRef(data);
    if (data.action === 'dispose') this._dispose(data);
  };

  private _deleteValue({ id, path, ref }: TargetAction) {
    const value = this._deleteProperty(path!, ref!);
    this._postMessage({ id, value, action: 'result' });
  }

  private _setValue({ id, path, ref, args }: TargetAction) {
    const value = this._setProperty(path!, ref!, args![0]);
    this._postMessage({ id, value, action: 'result' });
  }

  private _sendValue({ id, path, ref }: TargetAction) {
    const value = this._getProperty(path!, ref);
    this._postMessage({ id, value, action: 'result' });
  }

  private async _sendRef({ id, path, args = [], ref }: TargetAction) {
    const func = this._getProperty(path!, ref);

    const releasedArgs: Array<any> = [];
    for (const arg of args) {
      if (arg.type === 'basic') {
        releasedArgs.push(arg.value);
        continue;
      }
      if (arg.type === 'function') {
        let fn = this._callbackCache.get(arg.value);

        if (!fn) {
          const fnId = ID();
          fn = (...params: Array<any>) => {
            this._refCache.set(fnId, params);

            this._postMessage({
              id: arg.value,
              value: [fnId, params.length],
              action: 'callback',
            });
          };
          this._callbackCache.set(arg.value, fn);
        }

        releasedArgs.push(fn);
        continue;
      }
    }

    const refPath = ID();
    try {
      const result = func(...releasedArgs);
      this._refCache.set(refPath, result);
      this._postMessage({ id, value: refPath, action: 'result' });
    } catch (error) {
      this._refCache.set(refPath, error);
      this._postMessage({ id, value: refPath, action: 'exception' });
    }
  }

  private _dispose({ id, args = [] }: TargetAction) {
    for (const { value } of args) {
      if (this._callbackCache.has(value)) {
        this._callbackCache.delete(value);
      } else if (this._refCache.has(value)) {
        this._refCache.delete(value);
      }
    }
    this._postMessage({ id, value: undefined, action: 'result' });
  }

  private _postMessage(result: TargetResult) {
    this._target.postMessage<TargetResult>(result);
  }

  // tslint:disable:ban-types
  private _getProperty(path: Array<string>, ref?: string): Function {
    let source: any;

    if (ref && this._refCache.has(ref)) {
      source = this._refCache.get(ref);
    } else {
      source = this._data;
    }
    if (path.length === 0) {
      return source;
    }
    const value = get(source, path);
    if (typeof value === 'function') {
      let parent: any = source;
      if (path.length > 1) {
        parent = get(source, path.slice(0, path.length - 1));
      }
      const key = path.slice(-1)[0];
      return (...args: Array<any>) => parent[key](...args);
    } else {
      return value;
    }
  }

  private _setProperty(path: Array<string>, ref: string, value: any): void {
    let source: any;

    if (path.length === 0 && this._refCache.has(ref)) {
      this._refCache.set(ref, value);
      return;
    } else if (this._refCache.has(ref)) {
      source = this._refCache.get(ref);
    } else {
      source = this._data;
    }

    const end = path.pop()!;
    const parent = get(source, path);
    parent[end] = value;
  }

  private _deleteProperty(path: Array<string>, ref: string): void {
    let source: any;

    if (path.length === 0 && this._refCache.has(ref)) {
      this._refCache.delete(ref);
      return;
    } else if (this._refCache.has(ref)) {
      source = this._refCache.get(ref);
    } else {
      source = this._data;
    }

    const end = path.pop()!;
    const parent = get(source, path);
    delete parent[end];
  }
}
