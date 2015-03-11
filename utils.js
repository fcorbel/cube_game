var Utils = Utils || {};

//UID
(function() {
  var uid = 0;
  Utils.getUID = function() {

    return ++uid;
  };
}());

//EventManager
Utils.EventManager = function(sync) {
  this.sync = sync;
  this.evQueue = [];
  this.evMap = {};
};
Utils.EventManager.prototype.register = function(name, cbk) {
  if (!this.evMap[name]) {
    this.evMap[name] = [];
  }
  this.evMap[name].push(cbk);
};
Utils.EventManager.prototype.unRegister = function(name, cbk) {
  var cbks = this.evMap[name];
  if (cbks) {
    for (var i=0, l=cbks.length; i<l; i++) {
      if (cbks[i] === cbk) {
        cbks.splice(i, 1);
        break;
      } 
    }
  }
};
Utils.EventManager.prototype.processEvent = function(name, args) {
  if (this.evMap[name]) {
    var cbks = this.evMap[name];
    for (var i=0, l=cbks.length; i<l; i++) {
      if (!cbks[i]) {
        console.error("A callback is missing for event: "+name);
        return null;
      }
      cbks[i].apply(undefined, args);
    }
  }
};
Utils.EventManager.prototype.send = function(name) {
  if (this.sync) {
    this.processEvent(name, Array.prototype.slice.call(arguments, 1));
  } else {
    this.evQueue.push([name, Array.prototype.slice.call(arguments, 1)]);
  }
};
Utils.EventManager.prototype.process = function() {
  for (var i=0; i<this.evQueue.length; i++) { //Warn: the length might change following the process of an event
    var ev = this.evQueue[i];
    this.processEvent(ev[0], ev[1]);
    // console.log("process: "+ev[0]);
  }
  this.evQueue = [];
};

//Merge
Utils.merge = function(target, source) {
  //like jquery extend
  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  if (arguments.length > 2) {
    for (var i=2, l=arguments.length; i<l; i++) {
      for (key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          target[key] = arguments[i][key];
        }
      }
    }
  }
  return target;
};

//Equals
Utils.arrayShallowEqual = function(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every(function(el, i) {
    return el === arr2[i];
  });
};
