import { Subject } from '../../reactive';
import { ITarget, ActionFunc, EventData } from '../index';

// tslint:disable:max-classes-per-file
export class MockTarget implements ITarget {
  constructor(private _send: Subject<EventData<any>>, private _recieve: Subject<EventData<any>>) {}

  addEventListener(_msg: string, cb: ActionFunc<any>) {
    this._recieve.subscribe((event) => setTimeout(() => cb(JSON.parse(JSON.stringify(event))), 0));
  }

  // tslint:disable:no-empty
  removeEventListener() {}

  postMessage(data: any) {
    setTimeout(() => this._send.next(JSON.parse(JSON.stringify({ data }))), 0);
  }
}
