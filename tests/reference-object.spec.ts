import { DataSource, Reference } from "../src"
import { MessageChannel, MessagePort } from "./mocks"

describe('IReferenceObject', () => {
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

  it('Should send a basic value', async () => {
    const data = { foo: { bar: { value: 'foobar' }}}
    source = new DataSource(port2, data)
    const ref0 = new Reference<typeof data>(port1)
  
    const ref1 = ref0.property('foo', 'bar', 'value')
    const value = await ref1.value()
    expect(value).toBe(data.foo.bar.value)
  })

  it('Should set a value', async () => {
    const data = { foo: 'foo' }
    source = new DataSource(port2, data)
    const ref0 = new Reference<typeof data>(port1)
  
    const ref1 = ref0.property('foo')
    await ref1.set('bar')

    expect(data.foo).toBe('bar')
  })
})