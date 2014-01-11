(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  var testAndraia = new Andraia('game-cube', {
    'enableRouter': false
  });

  module('Andraia', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();

      // Register the model and add some properties / methods for testing later
      testAndraia.registerModel('testModel', function() {
        this.passesTest = true;
        var localProperty = true;
        
        this.shouldPassTest = function (booleanVal) {
          return !!booleanVal;
        };
        
        this.setTestToFail = function() {
          this.passesTest = false;
        };
      });
    }
  });

  test('loads model', function() {
    expect(6);

    // Make sure the model is loaded
    strictEqual(testAndraia.hasModel('testModel'), true, 'Model should be properly loaded into memory in the framework.');

    // Load the model
    var testModel = testAndraia.loadModel('testModel');

    // Check public property
    strictEqual(!!testModel.passesTest, true, 'Public property shoud be accessible and have a true value.');
    strictEqual(typeof testModel.localProperty, 'undefined', 'Should not have access to local properties within the model.');
    
    // Test shouldPassTest model method
    strictEqual(!!testModel.shouldPassTest(true), true, 'Public method should return true with a truthy argument.');
    strictEqual(!!testModel.shouldPassTest(), false, 'Public method should return false with a falsy argument, like nothing.');
    
    // Test altering model properties
    testModel.setTestToFail();
    strictEqual(!!testModel.passesTest, false, 'Public property should be false after manipulation.');
  });

}(jQuery));
