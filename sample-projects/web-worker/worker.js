import 'https://cdn.davidalsh.com/rpc/latest.js'
// import 'http://localhost:8080/dist/umd/index.js'

// Create and transfer ports
const { port1, port2 } = new MessageChannel()
self.postMessage('PORT_TRANSFER', [port2])
port1.start()

// Access exposed Window from host page
const ref0 = new RPC.Reference(port1)

// // Make a div
const ref1 = await ref0.property('document', 'createElement').exec('div')
await ref1.property('innerText').set('Hello from the Worker!')
const ref2 = await ref0.property('document', 'body', 'appendChild').exec(ref1)

