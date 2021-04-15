// @ts-ignore
import Worker from 'worker-loader?inline=no-fallback!./index.worker'
import { createHandle } from '@alshdavid/rpc'
import { Source } from './types'

void async function() {
  const { port1, port2 } = new MessageChannel()
  const worker = new Worker()
  worker.postMessage(undefined, [port2])

  const h0 = createHandle<Source>(port1)
  console.log(await h0.property('foo').value())
}()
