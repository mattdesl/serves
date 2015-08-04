var path = require('path')
var browserify = require('browserify')
var cwd = __dirname

require('../')({
  cwd: cwd,
  title: 'test',
  src: 'client.js',
  entry: function (req, res) {
    browserify(path.join(cwd, 'client.js'))
      .bundle()
      .pipe(res)
  }
}, function (err, ev) {
  if (err) throw err
  console.log('listening on', ev.url)
})
