export const get = (value: any, path: string[], defaultValue: any = undefined) => {
  return path.reduce((acc, v) => {
    try {
      acc = (acc[v] !== undefined && acc[v] !== null) ? acc[v] : defaultValue
    } catch (e) {
      return defaultValue
    }
    return acc
  }, value);
}