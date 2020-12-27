

const obs = await remote
  .property('foo')
  .property('bar')
  .exec('something')


const sub = await obs
  .property('subscribe')
  .exec(v => console.log(v))

sub
  .property('unsubscribe')
  .exec()