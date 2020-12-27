// @ts-ignore
import Worker from 'worker-loader?inline=no-fallback!./index.worker'
import { Handle } from './remote-execution'

const worker = new Worker()
const handle = new Handle(worker)

void async function() {
  await handle
    .exec((v:any) => console.log(v))
}()


// void async function() {
//   const ref1 = await handle
//     .property('foo')
//     .exec()
  
//   const ref2 = await ref1
//     .property('bar')
//     .exec('test')

//   const result = await ref2
//     .value()
  
//   console.log(result)
// }()

// void async function() {
//   const ref = await handle.exec('value')
//   console.warn(await ref.value())
// }

// void async function() {
//   const ref = await handle
//     .property('foo')
//     .exec('value')

//   const result = await ref.value()
//   console.log(result)
// }

// void async function() {
//   const ref = await handle
//     .property('foo')
//     .exec('value')
  
//   const result = await ref
//     .property('bar')
//     .value()
  
//   console.log(result)
// }

// void async function() {
//   handle
//     .value()
//     .then(console.warn)
// }

// void async function() {
//   handle
//     .property('foo')
//     .property('bar')
//     .value()
//     .then(console.warn)
// }



