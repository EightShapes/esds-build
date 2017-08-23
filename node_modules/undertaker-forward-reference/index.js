'use strict';

var util = require('util');
var assert = require('assert');

var DefaultRegistry = require('undertaker-registry');

function buildTempTask(tasks, name) {
  var tempTask = function() {
    var task = tasks[name];
    assert(task, 'Forward referenced task \'' + name +
      '\' not defined before use');
    return task.apply(null, arguments);
  };

  tempTask.displayName = name;

  return tempTask;
}

function ForwardRefRegistry() {
  if (this instanceof ForwardRefRegistry === false) {
    return new ForwardRefRegistry();
  }

  DefaultRegistry.call(this);
}
util.inherits(ForwardRefRegistry, DefaultRegistry);

// Assumes this._tasks from DefaultRegistry
ForwardRefRegistry.prototype.get = function(name) {
  var task = this._tasks[name];
  if (task) {
    return task;
  }

  return buildTempTask(this._tasks, name);
};

module.exports = ForwardRefRegistry;
