import { DataSource, Reference } from "../src"
import { MessageChannel, MessagePort } from "./mocks"

const MOCK_VALUE = 'MOCK_VALUE'

describe('SendHelp', () => {
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

  it('Object with a function', async () => {
    const data = { foo: () => MOCK_VALUE }
    source = new DataSource(port2, data)
    const ref0 = new Reference<typeof data>(port1)
    
    const ref1 = ref0.property('foo')
    const ref2 = await ref1.exec()

    expect(await ref2.value()).toBe(MOCK_VALUE)

    ref2.release()
  })
})