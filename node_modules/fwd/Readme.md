
# fwd

Forward one `(emitter|stream)`'s events to another -> connect parts of your application whose interface you have no control over.

This is compatible both with the node-core EventEmitter and with [component/emitter](https://github.com/component/emitter).

## Installation

```bash
$ component install juliangruber/fwd
$ npm install fwd
```
## Usage

### EventEmitter → EventEmitter

```javascript
var fwd = require('fwd');
var Stream = require('stream');
var EventEmitter = require('events').EventEmitter;
// or: var EventEmitter = require('emitter')

var src = new EventEmitter();
var dest = new EventEmitter();

fwd(src, dest);

dest.on('event', function() {
  // success
});

src.emit('event');
```

### Stream → EventEmitter

```javascript
var src = new Stream();
src.readable = true;
var dest = new EventEmitter();

fwd(src, dest, {'data': 'entry'});
```

### EventEmitter → Stream

```javascript
var src = new EventEmitter();
var dest = new Stream();
dest.writable = true;

fwd(src, dest, 'entry');
fwd(src, dest, {'wrong': JSON.stringify});
```

### Stream → Stream

```javascript
var src = new Stream();
src.readable = true;
var dest = new Stream();
dest.writable = true;

fwd(src, dest, function(data) {
  return data*2;
});
```

### Rules

You can rewrite data on-the-fly:

```javascript
var src = new EventEmitter();
var dest = new EventEmitter();

fwd(src, dest, '*');                                // the same as with no 3rd argument
fwd(src, dest, ['event1', 'event2'])                // only forward event1 and event2
fwd(src, dest, [{'event1': 'entry'}, '*'])          // forward event1 as entry and everything else
fwd(src, dest, [{'event1': function(data) {         // forward event1 with it's data doubled 
  return data*2;
}}]);
fwd(src, dest, [{'event1': function(event, data) {  // also rewrite the event name
  return {
    event: 'event-foo',
    data : data*2
  }
}}]);
fwd(src, dest, function(event, data) {              // forward and rewrite everything
  return {                                          // the same as: {'*': function(){ ... }}
    event: 'my-'+event,
    data : JSON.stringify(data)
  }
});
```

## API

### fwd(src, dest)

Forward all events from `src` to `dest`.

### fwd(src, dest, event=string)

Forward only `event`.

### fwd(src, dest, events=[string,..])

Forward only `events`.

### fwd(src, dest, mapping={from: to})

Rewrite names and fwd only that. `mapping` can be in an array to do multiple rewrites at one.

### fwd(src, dest, fn=function)

Apply `fn` to

* `(data)` and return modified `data`
* `(event, data)` and return `{event:'event', data:'data'}`

`fn` can also appear inside mappings.

### stop()

`stop` is returned by every `fwd`-call, so you can stop forwarding. Use this as stream-unpipe which isn't in the stream class yet.

## Tests

```bash
$ git clone https://github.com/juliangruber/fwd.git && cd fwd
$ npm install
$ mocha
```

## License

Copyright (c) 2012 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
