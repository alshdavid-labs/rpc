// @ts-ignore
import Worker from 'worker-loader?inline=no-fallback!./index.worker'
import { Handle } from '@alshdavid/intercom'

const worker = new Worker()
const handle = new Handle(worker)


void async function() {
  const sub = await handle
    .property('subscribe')
    .exec((v:any) => console.log(v))

  await new Promise(res => setTimeout(res, 3000))

  await sub
    .property('unsubscribe')
    .exec()
}()
