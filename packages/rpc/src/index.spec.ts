import { Subject } from 'rxjs';
import { createHandle, createSource, IHandle, ITarget, ActionFunc, EventData } from './index';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve));
}

// tslint:disable:max-classes-per-file
class Target implements ITarget {
  constructor(private _send: Subject<EventData<any>>, private _recieve: Subject<EventData<any>>) {}

  addEventListener(_msg: string, cb: ActionFunc<any>) {
    this._recieve.subscribe((data) => cb(data));
  }

  // tslint:disable:no-empty
  removeEventListener() {}

  postMessage(data: any) {
    setTimeout(() => this._send.next(JSON.parse(JSON.stringify({ data }))), 0);
  }
}

const VALUE_1 = 'VALUE_1';

class Data {
  public v0 = VALUE_1;
  public v1 = 1;
  public v2 = 0;
  public v3 = true;
  public v4 = false;
  public v5 = [VALUE_1];
  public v6 = { foo: VALUE_1 };
  public v9 = new Subject<string>();
  public v10 = Promise.resolve(VALUE_1);
  public v7 = () => VALUE_1;
  public v8 = (cb: (v: string) => any) => cb(VALUE_1);
  public v11 = () => new Promise<string>((res) => setTimeout(() => res(VALUE_1), 0));
  public v12 = (value: string) => value;
}

describe('rpc', () => {
  let port1: Subject<EventData<any>>;
  let port2: Subject<EventData<any>>;
  let sourceTarget: ITarget;
  let handleTarget: ITarget;
  let data: Data;
  let h0: IHandle<Data>;

  beforeEach(() => {
    port1 = new Subject<EventData<any>>();
    port2 = new Subject<EventData<any>>();

    sourceTarget = new Target(port1, port2);
    handleTarget = new Target(port2, port1);

    data = new Data();

    createSource(sourceTarget, data);
    h0 = createHandle(handleTarget);
  });

  afterEach(() => {
    port1.complete();
    port2.complete();
  });

  it('Should get string value', async () => {
    expect(await h0.property('v0').value()).toBe(VALUE_1);
  });

  it('Should get number values', async () => {
    expect(await h0.property('v1').value()).toBe(1);
    expect(await h0.property('v2').value()).toBe(0);
  });

  it('Should get boolean values', async () => {
    expect(await h0.property('v3').value()).toBe(true);
    expect(await h0.property('v4').value()).toBe(false);
  });

  it('Should get value from array', async () => {
    const h1 = h0.property('v5');
    const result = await h1.property(0).value();
    expect(result).toBe(VALUE_1);
  });

  it('Should get value from object', async () => {
    const h1 = h0.property('v6');
    const result = await h1.property('foo').value();
    expect(result).toBe(VALUE_1);
  });

  it('Should run method', async () => {
    const h1 = await h0.property('v7').exec();
    const result = await h1.value();
    expect(result).toBe(VALUE_1);
  });

  it('Should run method with args', async () => {
    const h1 = await h0.property('v12').exec(VALUE_1);
    const result = await h1.value();
    expect(result).toBe(VALUE_1);
  });

  it('Should get promise value (long)', async () => {
    const callback = jest.fn();
    await h0.property('v10').property('then').exec(callback);
    await flushPromises();
    expect(callback).toBeCalledWith(VALUE_1);
  });

  it('Should get promise factory value (long)', async () => {
    const callback = jest.fn();
    const h1 = await h0.property('v11').exec();
    await h1.property('then').exec(callback);
    await flushPromises();
    expect(callback).toBeCalledWith(VALUE_1);
  });

  it('Should get promise value (short)', async () => {
    const h1 = await h0.property('v10').promise();
    expect(h1).toBe(VALUE_1);
  });

  it('Should get promise factory value (short)', async () => {
    const h1 = await h0.property('v11').exec();
    const result = await h1.promise();
    expect(result).toBe(VALUE_1);
  });

  it('Should run method that accepts callback', async () => {
    const callback = jest.fn();
    await h0.property('v8').exec(callback);
    expect(callback).toBeCalledWith(VALUE_1);
  });

  it('Should send callback to subject of callback', async () => {
    const callback = jest.fn();
    await h0.property('v9').property('subscribe').exec(callback);
    data.v9.next(VALUE_1);
    await flushPromises();
    expect(callback).toBeCalledWith(VALUE_1);
  });

  it('Should dispose of callback', async () => {
    const callback = jest.fn();
    const h1 = await h0.property('v9').property('subscribe').exec(callback);
    data.v9.next(VALUE_1);
    await flushPromises();

    expect(callback).toBeCalledWith(VALUE_1);

    await h1.property('unsubscribe').exec();
    h1.dispose();

    data.v9.next(VALUE_1);
    await flushPromises();
    expect(callback).toBeCalledTimes(1);
  });
});
