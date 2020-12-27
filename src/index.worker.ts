

import { Receiver } from './remote-execution'

// const target = (v: any) => {
//   console.log(v)
//   return v + 'result'
// }

// const target = 'value'

// const target = {
//   foo: 'bar'
// }

// const target = {
//   foo: {
//     bar: 'foobar'
//   }
// }

// const target = {
//   foo: (v: any) => {
//     console.log(v)
//     return v + 'result'
//   }
// }


const target = {
  foo: () => {
    return {
      bar: (text: string) => text + '===' + text 
    }
  }
}

new Receiver(self, target)

