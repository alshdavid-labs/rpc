import { Handle, IHandle } from './handle';
import { ISource, Source } from './source';
import { ITarget } from './types';

export const createHandle = <T = any>(target: ITarget): IHandle<T> => new Handle(target, [], '', new Map()) as any;
export const createSource = (target: ITarget, source: any): ISource => new Source(target, source) as any;
