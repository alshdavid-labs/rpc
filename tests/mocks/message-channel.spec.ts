import { MessagePort } from './message-port'
import { MessageChannel } from './message-channel'

const MOCK_VALUE = 'foo'

describe('MessageChannel', () => {
  describe('constructor', () => {
    it('should not throw', () => {
      const testFunc = () => new MessageChannel()
      expect(testFunc).not.toThrow()
    })
  })

  describe('instance', () => {
    let messageChannel: MessageChannel
    let port1: MessagePort
    let port2: MessagePort

    beforeEach(() => {
      messageChannel = new MessageChannel()
      port1 = messageChannel.port1
      port2 = messageChannel.port2
    })

    it('should send message to other port', async () => {
      const fn = jest.fn()
    
      port1.start()
      port2.start()
    
      port1.addEventListener('message', fn)
      await port2.postMessage(MOCK_VALUE)
    
      expect(fn).toBeCalledTimes(1)
      expect(fn.mock.calls[0][0]).toEqual({ data: MOCK_VALUE })
    })
  })
})
