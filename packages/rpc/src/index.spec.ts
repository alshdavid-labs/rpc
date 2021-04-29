import { ErrorHandle } from './error-handle';
import { createHandle, createSource, IHandle, ITarget, EventData, Handle } from './index';
import { firstValueFrom, Subject } from './subject';
import { MockTarget } from './testing/mock-target';
import { PromiseSubject } from './testing/promise-subject';
import { unwrapPromise } from './unwrap-promise';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve));
}

const VALUE_1 = 'VALUE_1';
const VALUE_2 = 'VALUE_2';

class Source {
  public v0 = VALUE_1;
  public v1 = 1;
  public v2 = 0;
  public v3 = true;
  public v4 = false;
  public v5 = [VALUE_1];
  public v6 = { foo: VALUE_1 };
  public v9 = new Subject<string>();
  public v10 = Promise.resolve(VALUE_1);
  public v17subject = new Subject();
  public v17 = firstValueFrom(this.v17subject);
  public v13 = jest.fn();
  public v15 = () => Promise.reject(new Error(VALUE_1));
  public v16 = () => {
    throw new Error(VALUE_1);
  };
  public v7 = () => VALUE_1;
  public v8 = (cb: (v1: string) => any) => cb(VALUE_1);
  public v14 = (cb: () => any) => cb();
  public v11 = () => new Promise<string>((res) => setTimeout(() => res(VALUE_1), 0));
  public v12 = (value: string) => value;
}

describe('rpc', () => {
  let port1: Subject<EventData<any>>;
  let port2: Subject<EventData<any>>;
  let sourceTarget: ITarget;
  let handleTarget: ITarget;
  let source: Source;
  let h0: IHandle<Source>;

  beforeEach(() => {
    port1 = new Subject<EventData<any>>();
    port2 = new Subject<EventData<any>>();

    sourceTarget = new MockTarget(port1, port2);
    handleTarget = new MockTarget(port2, port1);

    source = new Source();

    createSource(sourceTarget, source);
    h0 = createHandle(handleTarget);
  });

  afterEach(() => {
    port1.complete();
    port2.complete();
  });

  describe('property', () => {
    it('Should provide handle to property', async () => {
      const h1 = h0.property('v0');
      expect(h1 instanceof Handle).toBe(true);
    });
  });

  describe('value', () => {
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
  });

  describe('set', () => {
    it('Should set value', async () => {
      await h0.property('v0').set(VALUE_2);
      expect(source.v0).toBe(VALUE_2);
    });
  });

  describe('delete', () => {
    it('Should delete value', async () => {
      await h0.property('v0').delete();
      expect(Object.keys(source)).not.toContain('v0');
    });
  });

  describe('exec', () => {
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

    it('Should run method that accepts callback', async () => {
      const callback = jest.fn();
      await h0.property('v14').exec(callback);
      expect(callback).toBeCalled();
    });

    it('Should provide callback with handle to the value', async (done) => {
      await h0.property('v8').exec(async (h0h0) => {
        expect(typeof h0h0 === 'string').toBe(false);
        expect(h0h0 instanceof Handle).toBe(true);
        const result = await h0h0.value();
        expect(result).toBe(VALUE_1);
        done();
      });
    });

    it('Should pass the same function reference to the source', async () => {
      const callback = jest.fn();
      await h0.property('v13').exec(callback);
      await h0.property('v13').exec(callback);
      expect(source.v13.mock.calls[0][0]).toBe(source.v13.mock.calls[1][0]);
    });

    it('should rethrow rejected value', async () => {
      try {
        await h0.property('v16').exec();
        expect(true).toBe(false);
      } catch (error) {
        expect(error instanceof ErrorHandle).toBe(true);
      }
    });

    it('should rethrow rejected value (async)', async () => {
      try {
        await h0.property('v10').exec();
        expect(true).toBe(false);
      } catch (error) {
        expect(error instanceof ErrorHandle).toBe(true);
      }
    });
  });

  describe('dispose', () => {
    it('Should dispose of callback', async () => {
      const callback = jest.fn();
      const onDone = new PromiseSubject<IHandle<string>>();
      const h1 = await h0
        .property('v9')
        .property('subscribe')
        .exec((result) => {
          callback();
          if (!onDone.hasSettled()) {
            onDone.resolve(result);
          }
        });

      source.v9.next(VALUE_1);

      await onDone;
      const h0h0 = await onDone;

      expect(await h0h0.value()).toBe(VALUE_1);

      await h1.exec();
      h1.dispose();

      source.v9.next(VALUE_1);
      await flushPromises();

      expect(callback).toBeCalledTimes(1);
    });
  });

  describe('unwrapPromise', () => {
    it('Should resolve resolved value', async () => {
      const h1 = h0.property('v10');
      const result = await unwrapPromise(h1);
      expect(await result.value()).toBe(VALUE_1);
    });

    // it('should rethrow rejected value', async () => {
    //   try {
    //     setTimeout(() => source.v17subject.error(VALUE_1), 500);
    //     await unwrapPromise(h0.property('v17'));
    //     expect(true).toBe(false);
    //   } catch (error) {
    //     expect(error instanceof ErrorHandle).toBe(true);
    //   }
    // });
  });
});
