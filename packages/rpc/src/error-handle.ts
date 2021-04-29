import { IHandle } from './handle';

export class ErrorHandle extends Error implements IHandle<any> {
  constructor(private _handle: IHandle<any>) {
    super('use "await error.property("message").value()" to traverse error');
  }

  property(key: any) {
    return this._handle.property(key);
  }

  exec(...args: Array<any>) {
    return this._handle.exec(...args);
  }

  value() {
    return this._handle.value();
  }

  set(value: any) {
    return this._handle.set(value);
  }

  delete() {
    return this._handle.delete();
  }

  dispose() {
    return this._handle.dispose();
  }
}
