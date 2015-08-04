var httpServer = require('../')
var test = require('tape')
var get = require('simple-get')
var parallel = require('run-parallel')
var through = require('through2')

test('resolve entry file, default html', function (t) {
  var defaultIndex = '<!doctype html><head><title>foobar</title><meta charset="utf-8"></head><body><script src="static/entry%20space.js"></script></body></html>'
  t.plan(4)
  var server = httpServer({
    cwd: __dirname,
    entry: 'static/entry space.js',
    title: 'foobar'
  }, function (err, ev) {
    if (err) return t.fail(err)
    t.equal(ev.port, 8080, 'defaults to 8080')
    t.equal(ev.host, 'localhost', 'defaults to localhost')
    parallel([
      expect(t, ev.url, defaultIndex, 'matches HTML'),
      expect(t, ev.url + 'static/entry space.js', "console.log('Fello')\n", 'matches JS')
    ], function (err) {
      if (err) t.fail(err)
      server.close()
    })
  })
})

test('html with no JS, resolve entry function', function (t) {
  var index = '<html></html>'
  t.plan(1)
  var server = httpServer({
    cwd: __dirname,
    index: 'index2.html'
  }, function (err, ev) {
    if (err) return t.fail(err)
    parallel([
      expect(t, ev.url, index, 'custom index.html')
    ], function (err) {
      if (err) t.fail(err)
      server.close()
    })
  })
})

test('custom JS and options', function (t) {
  var defaultIndex = '<!doctype html><head><meta charset="utf-8"></head><body><script src="blah/blob.js"></script></body></html>'
  t.plan(5)
  var server = httpServer({
    cwd: __dirname,
    root: 'static',
    host: '127.0.0.1',
    port: 8070,
    src: 'blah/blob.js',
    entry: function (req, res) {
      var stream = through()
      stream.push('hello!')
      stream.push(null)
      stream.pipe(res)
    }
  }, function (err, ev) {
    if (err) return t.fail(err)
    t.equal(ev.port, 8070, 'port is 8070')
    t.equal(ev.host, '127.0.0.1', 'changes host')
    parallel([
      expect(t, ev.url, defaultIndex, 'matches HTML'),
      expect(t, ev.url + 'blah/blob.js', 'hello!', 'matches JS'),
      expect(t, ev.url + 'foo.txt', 'blah', 'serves root dir')
    ], function (err) {
      if (err) t.fail(err)
      server.close()
    })
  })
})

function expect (t, url, matches, message) {
  return function (done) {
    get.concat(url, function (err, data) {
      if (err) return done(err)
      t.equal(data.toString(), matches, message)
      done(null)
    })
  }
}
