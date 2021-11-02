# JavaScript RPC Library

### Workers and iFrames

This library serves to be a low level RPC implementation for JavaScript that allows for the accessing of data and calling of functions/methods that live in an external context.

Such use cases are iframes and web workers. This can also be used with web sockets for cooperative server side execution.

```typescript
import { Reference } from '@alshdavid/rpc'

// Worker Data = { foo: () => 'bar' }
const ref0 = new Reference(port1)

const ref1 = ref0.property('foo')
const ref2 = ref1.exec()

const value = await ref2.value()
console.log(value) // 'bar'
```

## Usage

### Summary

This is split into two halves, the half that holds the data you want to expose - known as the `DataSource` and the half that wants to consume the data. 

An example data source would be a web worker holding data that the host page wants to access. Alternatively, it could be that the web worker that wants access to the document and the host page is the data source exposing the `window` object. 

The consumer accesses the data using a `Reference` which points to data in the `DataSource`. The consumer can walk up an object to find data or trigger methods.

#### Data Source

From your Data Source (iframe, worker), expose your data
```typescript
import { DataSource } from '@alshdavid/rpc'

const data = { foo: 'bar' }
const dataSource = new DataSource(port2, data)
```

#### Consumer

```typescript
import { Reference } from '@alshdavid/rpc'

// Connect to the DataSource and get your root reference
const ref0 = new Reference(port1)

// Crawl the tree
const ref1 = ref0.property('foo')

// Grab the value at the reference point
const value = await ref1.value()
```

#### Functions, Methods, Callbacks

Functions, methods along with callback arguments. Yes, you can send function accepting function accepting functions over a serialized boundary.

```typescript
// Data = () => 'Hello World'
const resultRef = await ref0.exec()
const value = await resultRef.value()

console.log(value) // 'Hello World'
```

```typescript
// Data = (value) => value
const resultRef = await ref0.exec('Hello World')
const value = await resultRef.value()

console.log(value) // 'Hello World'
```

```typescript
// Data = (callback) => void
await ref0.exec(() => {
  console.log('callback')
})
```

```typescript
// Data = (callback: (next: () => void) => void) => void
await ref0.exec(async nextRef => {
  await nextRef.exec()
})
```

#### Exceptions

Errors thrown in the data source are propagated to the consumer through the reference. The errors are references to the error in the data source.

```typescript
try {
  await ref0.exec()
} catch (errorRef) {
  console.log(await errorRef.reference.property('message').value())
}
```

#### Observed/Realized values vs Traversal

Values are not accessed until `.exec()` or `.value()` are run. Traversing an object using `.property()` will not incur a communication cost.

```typescript
// Data = { foo: { bar: { foobar: 'foobar' }}}

const ref1 = await ref0.property('foo') // Create reference with path
const ref2 = await ref1.property('bar', 'foobar') // Build it up

const foobar = await ref2.value() // Now get the value there 
```

#### Memory Management

There might be some improvements I can make here with time, but for now certain calls will incur a memory cost as certain values are stored on either side.

Things like function return values, callback function values, callback parameters, are all cached and must be manually purged when no longer needed

```typescript
// Data = () => 'Hello World'

const returnValueRef = await ref0.exec()
console.log(await returnValueRef.value()) // 'Hello World'

await returnValueRef.release() // Purge the cache for this return value

console.log(await returnValueRef.value()) // undefined
```

```typescript
// Data = (callback: (foo, bar) => void) => void

const returnValueRef = await ref0.exec(async (fooRef, barRef) => {
  console.log(await fooRef.value()) // 'foo'
  console.log(await barRef.value()) // 'bar'
})

ref0.release() // This will purge the 'foo' and 'bar' variables
```

### MessagePorts

The base API uses the browser `MessagePort` as the communication interface, so transfer your ports between your entities and you're good to go.

```typescript
import { Reference } from '@alshdavid/rpc'

const { port1, port2 } = new MessageChannel()

const iframe = document.createElement('iframe')
iframe.src = 'https://my-external-app'
iframe.contentWindow.postMessage('ports', '*', [port2])

const ref0 = new Reference(port1)
port1.start()
```


















