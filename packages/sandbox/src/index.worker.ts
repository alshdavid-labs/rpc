import { Subject } from 'rxjs'
import { Receiver } from '@alshdavid/intercom'

const target = new Subject()
let i = -1

setInterval(() => {
  i++
  target.next(i)
}, 1000)

new Receiver(self, target)