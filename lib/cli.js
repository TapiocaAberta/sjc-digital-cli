#!/usr/bin/env node
'use strict';
var meow = require('meow');
var sjcdigital = require('./');

var cli = meow([
  'Usage',
  '  $ sjcdigital [input]',
  '',
  'Options',
  '  --foo  Lorem ipsum. [Default: false]',
  '',
  'Examples',
  '  $ sjcdigital',
  '  unicorns',
  '  $ sjcdigital rainbows',
  '  unicorns & rainbows'
]);
