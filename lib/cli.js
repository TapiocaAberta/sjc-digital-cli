'use strict'

let meow = require('meow')
let bus = require('./bus')

let message = [
  'Usage',
  '  $ sjcdigital [input]',
  '',
  'Options',
  '  sjcdigital bus [downloads the bus data and creates a folder called bus with the result inside]',
  ''
]

let cli = meow(message)

switch (cli.input[0]) {
  case 'bus':
    bus.init()
    break
  default:
    cli.showHelp()
}
