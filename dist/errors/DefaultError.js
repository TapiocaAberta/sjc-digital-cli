'use strict';

function DefaultError() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this.name = 'DefaultError';
  this.message = options.message;
  this.type = options.type;
  this.errors = options.errors;
}

DefaultError.prototype = Object.create(Error.prototype);
DefaultError.prototype.constructor = DefaultError;

module.exports = DefaultError;