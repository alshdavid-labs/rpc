import { DataSource, DataConsumer } from "../src"
import { MessageChannel, MessagePort } from "./mocks"

describe('Integration', () => {
  let messageChannel: MessageChannel
  let port1: MessagePort
  let port2: MessagePort

  beforeEach(() => {
    messageChannel = new MessageChannel()
    port1 = messageChannel.port1
    port2 = messageChannel.port2
  })

  it('Should send a basic value', async () => {
    const data = 'Foo'
    const dataConsumer = new DataConsumer<typeof data>(port1)
    const dataSource = new DataSource(data, port2)
  
    const value = await dataConsumer.value()
    expect(value).toBe(data)
  
    dataSource.close()
  })
})