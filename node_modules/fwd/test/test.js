var fwd = require('../index');
var Emitter = require('events').EventEmitter;
var Stream = require('stream');
var expect = require('expect.js');
var EmitterComponent = require('emitter-component');

describe('fwd', function() {
  describe('fwd(ee, ee)', function() {
    var src, dest;
    beforeEach(function() {
      src = new Emitter();
      dest = new Emitter();
    });
    it('should forward all events', function(done) {
      fwd(src, dest);
      dest.on('event', function(data) {
        expect(data).to.be('data');
        done();
      });
      src.emit('event', 'data');
    });
    it('should forward one event', function(done) {
      fwd(src, dest, 'one');
      dest.on('one', function(data) {
        expect(data).to.be('my-data');
        done();
      });
      dest.on('another', function() {
        throw new Error('bad');
      });
      src.emit('enother');
      src.emit('one', 'my-data');
    });
    it('should forward multiple events', function(done) {
      fwd(src, dest, ['one', 'another']);
      var received = 0;
      dest.on('false', function() {
        throw new Error('bad');
      });
      dest.on('one', function(data) {
        expect(data).to.be('my-data');
        received++;
      });
      dest.on('another', function(data) {
        expect(data).to.be('my-data');
        expect(++received).to.be(2);
        done();
      });
      src.emit('false');
      src.emit('one', 'my-data');
      src.emit('another', 'my-data');
    });
    it('should support [*]', function(done) {
      fwd(src, dest, ['*']);
      dest.on('event', function(data) {
        expect(data).to.be('my-data');
        done();
      });
      src.emit('event', 'my-data');
    });
    it('should put single arguments in an array', function(done) {
      fwd(src, dest, '*');
      dest.on('event', function(data) {
        expect(data).to.be('my-data');
        done();
      });
      src.emit('event', 'my-data');
    });
    it('should support {from: to}', function(done) {
      fwd(src, dest, {'from': 'to'});
      dest.on('to', done);
      src.emit('from');
    });
    it('should support [{from: to}, *]', function(done) {
      fwd(src, dest, [{'from': 'to'}, '*']);
      var received = 0;
      dest.on('to', function() {
        received++;
      });
      dest.on('another', function() {
        expect(++received).to.be(2);
        done();
      });
      src.emit('from');
      src.emit('another');
    });
    it('should call a function with 1 argument', function(done) {
      fwd(src, dest, function(data) {
        expect(data).to.be('my-data');
        return 'changed';
      });
      dest.on('data', function(data) {
        expect(data).to.be('changed');
        done();
      });
      src.emit('data', 'my-data');
    });
    it('should call a function with 2 arguments', function(done) {
      fwd(src, dest, function(event, data) {
        expect(event).to.be('data');
        expect(data).to.be('my-data');
        return {
          'event': 'changed-event',
          'data' : 'changed-data'
        };
      });
      dest.on('changed-event', function(data) {
        expect(data).to.be('changed-data');
        done();
      });
      src.emit('data', 'my-data');
    });
    it('should call a function in a map', function(done) {
      fwd(src, dest, [{'change-me': function(data) {
        return 'changed-'+data;
      }}, '*']);
      var received = 0;
      dest.on('unchanged', function(data) {
        expect(data).to.be('data');
        received++;
      });
      dest.on('change-me', function(data) {
        expect(++received).to.be(2);
        expect(data).to.be('changed-data');
        done();
      });
      src.emit('unchanged', 'data');
      src.emit('change-me', 'data');
    });
    it('should stop', function() {
      var stop = fwd(src, dest);
      stop();
      dest.on('foo', function() {
        throw new Error("didn't stop");
      });
      src.emit('foo');
    });
  });
  describe('fwd(s, ee)', function() {
    var src, dest;
    beforeEach(function() {
      src = new Stream();
      src.readable = true;
      dest = new Emitter();
    })
    it('should forward all data', function(done) {
      fwd(src, dest, {'data': 'event'});
      dest.on('event', function(data) {
        expect(data).to.be('mydata');
        done();
      });
      src.emit('data', 'mydata');
    });
    it('should end', function() {
      fwd(src, dest);
      src.emit('end');
      dest.on('data', function() {
        throw new Error("didn't end");
      }); 
      src.emit('data', 'whoo');
    });
    it('should stop', function() {
      var stop = fwd(src, dest);
      stop();
      dest.on('data', function() {
        throw new Error("didn't stop");
      });
      src.emit('data', 'sth');
    });
  });
  describe('fwd(ee, s)', function() {
    var src, dest;
    beforeEach(function() {
      src = new Emitter();
      dest = new Stream();
      dest.writable = true;
    });
    it('should forward all data', function(done) {
      fwd(src, dest, 'event');
      dest.write = function(data) {
        expect(data).to.be('my-data');
        done();
      }
      src.emit('else', 'bad');
      src.emit('event', 'my-data');
    });
    it('should stop', function() {
      var stop = fwd(src, dest);
      stop();
      dest.write = function() {
        throw new Error("didn't stop");
      }
      src.emit('data', 'sth');
    });
  });
  describe('fwd(s, s)', function() {
    var src, dest;
    beforeEach(function() {
      src = new Stream();
      src.readable = true;
      dest = new Stream();
      dest.writable = true;
    })
    it('should forward all data', function(done) {
      fwd(src, dest);

      dest.write = function(data) {
        expect(data).to.be('my-data');
        done();
      }
      src.emit('data', 'my-data');
    });
    it('should end', function(done) {
      fwd(src, dest);
      dest.end = done; 
      src.emit('end');
    });
    it('should apply a function', function(done) {
      fwd(src, dest, function(data) {
        return data+'-changed';
      });
      dest.write = function(data) {
        expect(data).to.be('value-changed');
        done();
      }
      src.emit('data', 'value');
    });
    it('should stop', function() {
      var stop = fwd(src, dest);
      stop();
      dest.write = function() {
        throw new Error("didn't stop");
      }
      src.emit('data', 'sth');
    });
  });
  describe('acceptance', function() {
    var src, dest;
    beforeEach(function() {
      src = new Stream;
      src.readable = true

      var times = 0;
      var iv = setInterval(function () {
        src.emit('data', times + '\n');
        if (++times === 5) {
          src.emit('end');
          clearInterval(iv);
        }
      }, 1);
     
      dest = new Stream;
      dest.writable = true;

      dest.bytes = 0;

      dest.write = function (buf) {
        if (typeof buf == 'undefined') return;
        dest.bytes += buf.length;
      };

      dest.end = function (buf) {
        if (arguments.length) dest.write(buf);
        dest.writable = false;
      };

      dest.destroy = function () {
        dest.writable = false;
      };
    });
    it('should pipe', function(done) {
      dest.end = function(buf) {
        if (arguments.length) dest.write(buf);
        dest.writable = false;
        expect(dest.bytes).to.be(20);
        done();
      };
      fwd(src, dest, function(data) {
        return data+data;
      });
    });
    it('should fwd stream to emitter', function(done) {
      var dest = new Emitter();
      var bytes = 0;
      dest.on('data', function(data) {
        bytes += data.length;
        if (bytes==10) done();
      });
      fwd(src, dest, ['data', {'end': function(event, data) {
        if (data) event = 'data';
        return {event:event, data:data};
      }}]);
    });
    it('should fwd emitter to stream', function(done) {
      var src = new Emitter();
      dest.end = function(buf) {
        if (arguments.length) dest.write(buf);
        expect(dest.bytes).to.be(2);
        done();
      };
      fwd(src, dest);
      src.emit('data', '13');
      src.emit('end');
    });
  });
  describe('compatibility', function() {
    it('should be compatible with component/emitter', function(done) {
      var src = new EmitterComponent();
      var dest = new EmitterComponent();
      fwd(src, dest);
      dest.on('sky', function(data) {
        expect(data).to.be('open');
        done();
      });
      src.emit('sky', 'open');
    });
  });
});
