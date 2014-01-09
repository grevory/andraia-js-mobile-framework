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

  var testAndraia;

  module('jQuery#{%= js_safe_name %}', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
      testAndraia = new Andraia('game-cube', {
        'enableRouter': false
      });
    }
  });

  test('loads model', function() {
    expect(1);
    testAndraia.registerModel('testModel', function() {
      
      this.passesTest = true;
      
      this.shouldPassTest = function (booleanVal) {
        return !!booleanVal;
      };
      
      this.setTestToFail = function() {
        this.passesTest = false;
      };
    });

    var testModel = testAndraia.loadModel('testModel');
    strictEqual(!!testModel.passesTest, true, 'should pass test.');
  });

  // test('is awesome', function() {
  //   expect(1);
  //   strictEqual(this.elems.{%= js_safe_name %}().text(), 'awesome0awesome1awesome2', 'should be awesome');
  // });

  // module('jQuery.{%= js_safe_name %}');

  // test('is awesome', function() {
  //   expect(2);
  //   strictEqual($.{%= js_safe_name %}(), 'awesome.', 'should be awesome');
  //   strictEqual($.{%= js_safe_name %}({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  // });

  // module(':{%= js_safe_name %} selector', {
  //   // This will run before each test in this module.
  //   setup: function() {
  //     this.elems = $('#qunit-fixture').children();
  //   }
  // });

  // test('is awesome', function() {
  //   expect(1);
  //   // Use deepEqual & .get() when comparing jQuery objects.
  //   deepEqual(this.elems.filter(':{%= js_safe_name %}').get(), this.elems.last().get(), 'knows awesome when it sees it');
  // });

}(jQuery));
