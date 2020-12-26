import { Observable } from 'rxjs'
// @ts-ignore
import Worker from 'worker-loader?inline=no-fallback!./index.worker'
// import { Remote } from './remote-execution'

interface Remote {
  service(token: string | number): Query
}

interface Query {
  value<T>(): Promise<T>
  stream<T>(): Observable<T>
  method(name: string, args?: any[]): Query
  property(name: string): Query
}

// // @ts-ignore
const worker = new Worker()

worker.postMessage({}, [])


const remote = {} as Remote

  remote
    .service('foo')
    .method('bar', [1,2,3,4])
    .value<any>()
    .then(console.log)

  remote
    .service('foo')
    .method('onValue', [1])
    .method('subscribe')
    .stream<any>()
    .subscribe(console.log)




// void async function main() {
//   // remote.exec('foo')


  // const un = remote.observe('foo', ['onValue', 'subscribe']).subscribe(v => console.log(v))

  // const getOnValue = await remote.exec('foo', ['getOnValue'], ['updated:'])
  // getOnValue

  // const value1 = await remote.exec('foo', ['setValue'], ['update1'])

  // un.unsubscribe()

  // const value2 = await remote.exec('foo', ['setValue'], ['update2'])

  // console.log(value1, value2)
// }()