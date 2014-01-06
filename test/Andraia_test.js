'use strict';

var Andraia = require('../dev/Andraia.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

// exports['awesome'] = {
//   setUp: function(done) {
//     // setup here
//     done();
//   },
//   'no args': function(test) {
//     test.expect(1);
//     // tests here
//     test.equal(Andraia.awesome(), 'awesome', 'should be awesome.');
//     test.done();
//   }
// };

exports['models'] = {
  setUp: function(done) {
    Andraia.registerModel('');
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(Andraia.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};