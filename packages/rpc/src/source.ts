import { get } from './get';
import { ID } from './id';
import { ITarget, EventData, TargetAction, TargetResult } from './types';

export interface ISource {
  destroy(): void
}

export class Source implements Source {
  private _refCache = new Map<string, any>();

  constructor(private _target: ITarget, private _data: any) {
    _target.addEventListener('message', this._onMessage);
  }

  public destroy() {
    this._target.removeEventListener('message', this._onMessage);
  }

  private _onMessage = ({ data }: EventData<TargetAction>) => {
    if (data.action === 'value') this._sendValue(data);
    if (data.action === 'promise') this._sendResoledValue(data);
    if (data.action === 'exec') this._sendRef(data);
  };

  private _sendValue({ id, path, ref }: TargetAction) {
    const value = this._getProperty(path!, ref);
    this._target.postMessage<TargetResult>({ id, value, action: 'result' });
  }

  private async _sendResoledValue({ id, path, ref }: TargetAction) {
    const value = await this._getProperty(path!, ref);
    this._target.postMessage<TargetResult>({ id, value, action: 'result' });
  }

  private _sendRef({ id, path, args = [], ref }: TargetAction) {
    const func = this._getProperty(path!, ref);

    const releasedArgs: Array<any> = [];
    for (const arg of args) {
      if (arg.type === 'basic') {
        releasedArgs.push(arg.value);
        continue;
      }
      if (arg.type === 'function') {
        releasedArgs.push((...rArgs: Array<any>) => {
          this._target.postMessage<TargetResult>({ id: arg.value, value: rArgs, action: 'callback' });
        });
        continue;
      }
    }

    const result = func(...releasedArgs);
    const refPath = ID();
    this._refCache.set(refPath, result);
    this._target.postMessage<TargetResult>({ id, value: refPath, action: 'result' });
  }

  // tslint:disable:ban-types
  private _getProperty(path: Array<string>, ref?: string): Function {
    let source: any;
    if (ref) {
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
}
