#!/usr/bin/env node

'use strict';

var meow = require('meow');
var sjcdigital = require('./bus');

var cli = meow(['Usage', '  $ sjcdigital [input]', '', 'Options', '  sjcdigital bus [downloads the bus data and creates a folder called bus with the result inside]', '']);

sjcdigital(cli.input[0], cli.flags);