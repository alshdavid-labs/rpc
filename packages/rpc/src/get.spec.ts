import { get } from './get';

const VALUE_1 = 'VALUE_1';
const VALUE_2 = 'VALUE_2';
const SOURCE = { a: { b: { c: VALUE_1 } } };

describe('get', () => {
  it('Should get value', () => {
    const result = get(SOURCE, ['a', 'b', 'c']);
    expect(result).toBe(VALUE_1);
  });

  it('Should return default', () => {
    const result = get(SOURCE, ['nope'], VALUE_2);
    expect(result).toBe(VALUE_2);
  });

  it('Should return default', () => {
    const result = get(undefined, ['nope'], VALUE_2);
    expect(result).toBe(VALUE_2);
  });
});
