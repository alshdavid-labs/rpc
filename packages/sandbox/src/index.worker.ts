import { createSource } from '@alshdavid/rpc'
import { Source } from './types'

self.addEventListener('message', event => {
  const [ port2 ] = event.ports
  const source: Source = { foo: 'bar' }
  createSource(port2, source)
  port2.start()
})

