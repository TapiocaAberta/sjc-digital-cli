'use strict'
const {wrap} = require('co')
const meow = require('meow')
const Bus = require('./bus')
const bus = new Bus()
const message = [
  'Usage',
  '  $ sjcdigital [input]',
  '',
  'Options',
  '  sjcdigital bus [downloads the bus data and creates a folder called bus with the result inside]',
  ''
]

const cli = meow(message)

let main = wrap(function*(argument) {
  switch (cli.input[0]) {
    case 'bus':
      yield bus.execute()
      break
    default:
      cli.showHelp()
  }
})

main()
