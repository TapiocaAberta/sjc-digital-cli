'use strict';

var meow = require('meow');
var bus = require('./bus');

var message = ['Usage', '  $ sjcdigital [input]', '', 'Options', '  sjcdigital bus [downloads the bus data and creates a folder called bus with the result inside]', ''];

var cli = meow(message);

switch (cli.input[0]) {
  case 'bus':
    bus.init();
    break;
  default:
    cli.showHelp();
}