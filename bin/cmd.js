#!/usr/bin/env node
var color = require('term-color')
var argv = require('minimist')(process.argv.slice(2), {
  boolean: [],
  alias: {
    port: 'p',
    host: 'h',
    root: 'r',
    title: 't',
    css: 's',
    index: 'i'
  },
  string: ['root', 'title', 'index', 'host']
})

argv.cwd = process.cwd()
argv.entry = argv._[0]

require('../')(argv, function (err, ev) {
  if (err) {
    console.error(color.red('ERROR:'), err.message)
    process.exit(1)
  }
  console.log('Listening on', color.green(ev.url))
})
