var Riot = require('./riot').Riot,
    sys  = require('sys');

Riot.require('../reusable/lock.js');

Riot.context('Lock', function() {
  given('A lock', function() {
    var lock = new Lock();

    asserts('locked should be false', lock.locked).isFalse();
    asserts('the lock should lock', function() {
      lock.lock();
      return lock.locked;
    }).isTrue();

    // TODO: Testing timeout-based things is a problem
  });
});

Riot.run();
