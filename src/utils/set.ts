import { toKey } from "./to-key"
import { isObject } from "./type-check"

const MAX_SAFE_INTEGER = 9007199254740991
const reIsUint = /^(?:0|[1-9]\d*)$/
const hasOwnProperty = Object.prototype.hasOwnProperty

function isIndex(value: any) {
  const type = typeof value
  const length = MAX_SAFE_INTEGER

  return !!length &&
    (type === 'number' ||
      (type !== 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length)
}

function baseAssignValue(object: any, key: any, value: any) {
  if (key == '__proto__') {
    Object.defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    })
  } else {
    object[key] = value
  }
}

function eq(value: any, other: any) {
  return value === other || (value !== value && other !== other)
}

function assignValue(object: any, key: any, value: any) {
  const objValue = object[key]

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value))) {
    if (value !== 0 || (1 / value) === (1 / objValue)) {
      baseAssignValue(object, key, value)
    }
  } else if (value === undefined && !(key in object)) {
    baseAssignValue(object, key, value)
  }
}

export function set(object: any, path: any, value: any) {
  if (!isObject(object)) {
    return object
  }

  const length = path.length
  const lastIndex = length - 1

  let index = -1
  let nested = object

  while (nested != null && ++index < length) {
    const key = toKey(path[index])
    let newValue = value

    if (index != lastIndex) {
      const objValue = nested[key]
      newValue = isObject(objValue)
        ? objValue
        : (isIndex(path[index + 1]) ? [] : {})
    }
    assignValue(nested, key, newValue)
    nested = nested[key]
  }
  return object
}