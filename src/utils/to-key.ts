const INFINITY = 1 / 0

export function toKey(value: any) {
  if (typeof value === 'string') {
    return value
  }
  const result = `${value}`
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result
}