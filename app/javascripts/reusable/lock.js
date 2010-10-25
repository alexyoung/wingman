function Lock() {
  this.locked = false;
  this.lockTime = 1000;
}

Lock.prototype.lock = function() {
  this.locked = true;
};

Lock.prototype.timedUnlock = function() {
  var lock = this,
      fn = arguments[0];
  setTimeout(function() { lock.unlock(); if (fn) fn(); }, this.lockTime);
};

Lock.prototype.unlock = function() {
  this.locked = false;
};

