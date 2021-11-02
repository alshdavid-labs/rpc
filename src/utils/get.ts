import { toKey } from "./to-key"

export function get(object: any, path: any) {
  let index = 0
  const length = path.length

  while (object != null && index < length) {
    object = object[toKey(path[index++])]
  }
  return (index && index == length) ? object : undefined
}