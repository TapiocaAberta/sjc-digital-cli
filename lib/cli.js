'use strict'

const meow = require('meow')
const bus = require('./bus')
const message = [
  'Usage',
  '  $ sjcdigital [input]',
  '',
  'Options',
  '  sjcdigital bus [downloads the bus data and creates a folder called bus with the result inside]',
  ''
]

const cli = meow(message)

switch (cli.input[0]) {
  case 'bus':
    return bus.execute()
  default:
    cli.showHelp()
}
