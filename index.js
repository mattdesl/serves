var http = require('http')
var path = require('path')
var getport = require('getport')
var defaultHtml = require('simple-html-index')
var ecstatic = require('ecstatic')
var isAbsolute = require('path-is-absolute')

var url = require('url')

var DEFAULT_PORT = 8080
var noop = function () {}

module.exports = clientServer
function clientServer (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  opts = opts || {}
  cb = cb || noop

  var cwd = opts.cwd || process.cwd()
  var rootDir = opts.root
  if (typeof rootDir === 'string') {
    rootDir = isAbsolute(rootDir) ? rootDir : path.resolve(cwd, rootDir)
  } else {
    rootDir = cwd
  }

  var staticHandler = ecstatic(rootDir)
  var title = opts.title

  // optional script handler
  var entry = opts.entry
  var srcUrl = opts.src || 'index.js'
  var entryHandler
  if (typeof entry === 'string') {
    srcUrl = formatPathname(entry)
    entryHandler = staticHandler
  } else if (typeof entry === 'function') {
    entryHandler = function (req, res) {
      res.setHeader('content-type', 'application/javascript')
      return entry(req, res)
    }
  }

  // index.html handler
  var index = opts.index
  var indexUrl = null
  var indexHandler = defaultIndexHandler
  if (typeof index === 'string') {
    indexUrl = formatPathname(index)
    indexHandler = staticHandler
  } else if (typeof index === 'function') {
    indexHandler = function (req, res) {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return index(req, res, { entry: srcUrl, title: title })
    }
  }

  var server = http.createServer(function (req, res) {
    if (req.url === '/' || req.url === '/index.html') {
      if (indexUrl) {
        // user can hit `index.html` and get served
        // the static HTML file
        var parsed = url.parse(req.url)
        parsed.pathname = '/' + indexUrl
        req.url = url.format(parsed)
      }
      indexHandler(req, res)
    } else if (entryHandler && isEntry(req.url)) {
      entryHandler(req, res)
    } else {
      staticHandler(req, res)
    }
  })

  getport(opts.port || DEFAULT_PORT, function (err, port) {
    if (err) return cb(err)
    var host = opts.host || 'localhost'
    server.once('error', function (err) {
      server.close()
      cb(err)
      cb = noop
    })
    server.once('listening', function () {
      cb(null, {
        url: 'http://' + host + ':' + port + '/',
        host: host,
        port: port
      })
      cb = noop
    })
    server.listen(port, host)
  })

  return server

  function isEntry (url) {
    var expected = '/' + srcUrl.replace(/^\//, '')
    return url === expected
  }

  function defaultIndexHandler (req, res) {
    res.setHeader('content-type', 'text/html')
    defaultHtml({
      title: title,
      entry: srcUrl,
      css: opts.css
    }).pipe(res)
  }

  function formatPathname (file) {
    file = path.relative(cwd, path.resolve(cwd, file))
    return url.parse(file).pathname
  }
}
