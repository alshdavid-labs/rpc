import { IHandle } from './handle';
import { ErrorHandle } from './error-handle';

export const unwrapPromise = <T>(h0: IHandle<Promise<T>>): Promise<IHandle<T>> => {
  return new Promise<IHandle<T>>(async (res, rej) => {
    const handles: Array<IHandle<any>> = [];
    let shouldDispose = false;

    const digest = () => {
      if (shouldDispose && handles.length === 4) {
        for (const handle of handles) {
          handle.dispose();
        }
      }
    };

    const add = (hn: IHandle<any>) => {
      handles.push(hn);
      digest();
    };

    const dispose = () => {
      shouldDispose = true;
      digest();
    };

    const h1 = h0.property('then');
    const h2 = await h1.exec((h1h0) => {
      res(h1h0);
      dispose();
    });

    const h3 = h2.property('catch');
    const h4 = await h3.exec((h3h0) => {
      rej(new ErrorHandle(h3h0));
      dispose();
    });

    add(h1);
    add(h2);
    add(h3);
    add(h4);
  });
};
