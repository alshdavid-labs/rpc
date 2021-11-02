import { DataSource, IReference, IReferenceError, Reference } from "../src"
import { MessageChannel, MessagePort } from "./mocks"

const MOCK_VALUE = 'MOCK_VALUE'

describe('IReferenceFunction', () => {
  let messageChannel: MessageChannel
  let port1: MessagePort
  let port2: MessagePort
  let source: DataSource | undefined

  beforeEach(() => {
    messageChannel = new MessageChannel()
    port1 = messageChannel.port1
    port2 = messageChannel.port2
    port1.start()
    port2.start()
  })

  afterEach(() => {
    if (source) source.close()
  })

  it('Should execute a function', async () => {
    const data = jest.fn()
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    await ref0.exec()
    expect(data).toBeCalledTimes(1)
  })

  it('Should propagate a exception', async () => {
    const data = () => {throw new Error(MOCK_VALUE)}
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    await expect(ref0.exec()).rejects.toThrow()
  })

  it('Should allow traversal of error in exception', async () => {
    const data = () => {throw new Error(MOCK_VALUE)}
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    let message: string | undefined
    try {
      await ref0.exec()
    } catch (errorRef: any) {
      message = await (errorRef as IReferenceError).reference.property('message').value()
    }
    expect(message).toBe(MOCK_VALUE)
  })

  it('Should return values', async () => {
    const data = () => 'foo'
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    const ref1 = await ref0.exec()
    const value = await ref1.value()
    expect(value).toBe(data())
  })

  it('Should release cached returned value', async () => {
    const data = () => 'foo'
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    const ref1 = await ref0.exec()
    expect(await ref1.value()).toBe(data())

    ref1.release()
    expect(await ref1.value()).toBe(undefined)
  })

  it('Should forward basic arguments to function', async () => {
    const data = jest.fn<void, [string]>()
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    await ref0.exec(MOCK_VALUE)

    expect(data).toBeCalledTimes(1)
    expect(data).toBeCalledWith(MOCK_VALUE)
  })

  it('Should accept function as parameter', async () => {
    const data = jest.fn().mockImplementation((cb: () => void) => cb())
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    const callback = jest.fn()
    await ref0.exec(callback)

    expect(data).toBeCalledTimes(1)
    expect(callback).toBeCalledTimes(1)

    ref0.release()
  })

  fit('Should pass variables to callback as references', async () => {
    const data = (callback: (value: string) => void) => callback(MOCK_VALUE)
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    const argRef0: IReference<string> = await new Promise(res => {
      ref0.exec((arg) => res(arg))
    })

    const value = await argRef0.value()

    expect(value).toBe(MOCK_VALUE)

    ref0.release()
  })
})