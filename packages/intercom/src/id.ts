export const ID = (): string => {
  const [id] = crypto.getRandomValues(new Uint32Array(1))
  return id.toString()
}