# serves

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A tiny HTTP server CLI and API, mainly for local development.

Serves a [default `index.html`](https://www.npmjs.com/package/simple-html-index) and an optional JavaScript entry-point. By default, uses `localhost` and port `8080` (or searches for the next available port).

When using the programmatic API, the `entry` and `index` can be a `middleware(req, res)` function. For example, to bundle with [browserify](https://www.npmjs.com/package/browserify).

## Install

```sh
npm install serves [-g|--save]
```

## CLI Example

The following creates a server that hosts a default `index.html` with a `<script>` tag pointing to `src/index.js`. All other static content (images, etc) is served from the `public` root directory.

```sh
serves src/index.js --root public --port 9000
```

## API Example

A simple example:

```js
var serves = require('serves')
var path = require('path')

serves({
  cwd: process.cwd(),
  root: 'public',
  entry: 'src/index.js',
  title: 'My Site'
}, function (err, ev) {
  if (err) throw err
  console.log('Listening on', ev.url)
})
```

Or see [example/index.js](example/index.js), which mimics [wzrd](https://www.npmjs.com/package/wzrd) and bundles CommonJS on request.

## Usage

[![NPM](https://nodei.co/npm/serves.png)](https://www.npmjs.com/package/serves)

### CLI

```
Usage:
  serves [entry.js] [opts]
  
Options:
  --title, -t    HTML title
  --root, -r     root directory for static files (default cwd)
  --port, -p     base port to attempt (default 8080)
  --host, -h     host name (default localhost)
  --css, -s      optional path to a CSS file
  --index, -i    HTML file to serve as index.html
```

### API

#### `server = httpServer([opt], [cb])`

Creates a new HTTP server with the specified options and optional callback. Returns the `server` instance. 

Options:

- `cwd` (String|undefined)
  - the base directory to resolve file paths, defaults to `process.cwd()`
- `entry` (String|Function|undefined)
  - a JavaScript entry file path, relative to `cwd`
  - or, can be a `middleware(req, res)` function
  - if not specified, no `<script>` will be added to the HTML
- `index` (String|Function|undefined)
  - defaults to a bare-bones HTML index
  - the HTML index file path, relative to `cwd`
  - or, can be a `middleware(req, res, ev)` function
    - the `ev` parameter holds the `{ title, entry }` strings
- `root` (String|undefined)
  - the root directory to serve static content form, defaults to `cwd`
- `port` (Number|undefined)
  - the base port to start searching from, default `8080`
- `host` (String|undefined)
  - the host name, default `'localhost'`
- `title` (String|undefined)
  - the HTML title, if unspecified no `<title>` will be written
- `css` (String|undefined)
  - an optional href path for a `<link rel="stylesheet">` tag in the `<head>`
  - relative to `root` since it is just an href in the tag
  - only gets applied to the default `index` handler

If you specify a function for `entry`, the script will serve `'index.js'` by default. This pathname be changed with `opt.src`.

The callback takes the form `callback(err, ev)` with the following event parameters when the server starts listening:

```js
{
  url: String  // 'http://localhost:8080/'
  port: Number // 8080
  host: String // 'localhost'
}
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/serves/blob/master/LICENSE.md) for details.
