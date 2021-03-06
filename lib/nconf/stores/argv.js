/*
 * argv.js: Simple memory-based store for command-line arguments.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var util = require('util'),
    common = require('../common'),
    Memory = require('./memory').Memory;

//
// ### function Argv (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Argv nconf store, a simple abstraction
// around the Memory store that can read command-line arguments.
//
var Argv = exports.Argv = function (options, usage) {
  Memory.call(this, options);

  options        = options || {};
  this.type     = 'argv';
  this.readOnly = true;
  this.options  = options;
  this.usage    = usage;
  this.parseValues = options.parseValues || false;
  this.transform = options.transform || false;
};

// Inherit from the Memory store
util.inherits(Argv, Memory);

//
// ### function loadSync ()
// Loads the data passed in from `process.argv` into this instance.
//
Argv.prototype.loadSync = function () {
  this.loadArgv();
  return this.store;
};

//
// ### function loadArgv ()
// Loads the data passed in from the command-line arguments
// into this instance.
//
Argv.prototype.loadArgv = function () {
  var self = this,
      yargs, argv;

  yargs = typeof this.options === 'object'
    ? require('yargs')(process.argv.slice(2)).options(this.options)
    : require('yargs')(process.argv.slice(2));

  if (typeof this.usage === 'string') { yargs.usage(this.usage) }

  argv = yargs.argv

  if (!argv) {
    return;
  }

  if (this.transform) {
    argv = common.transform(argv, this.transform);
  }

  this.readOnly = false;
  Object.keys(argv).forEach(function (key) {
    var val = argv[key];

    if (typeof val !== 'undefined') {
      if (self.parseValues) {
        val = common.parseValues(val);
      }

      self.set(key, val);
    }
  });

  this.showHelp = yargs.showHelp
  this.help     = yargs.help

  this.readOnly = true;
  return this.store;
};
