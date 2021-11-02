import { DataSource, Reference } from "../src"
import { MessageChannel, MessagePort } from "./mocks"

describe('IReferenceBasic', () => {
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
    const data = 'Foo'
    source = new DataSource(data, port2)
    const ref0 = new Reference<typeof data>(port1)
    
    const value = await ref0.value()
    expect(value).toBe(data)
  })
})