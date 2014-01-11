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

      // Register a simple home-made template compiler
      testAndraia.registerTemplating(function(template, data){
        var dataIndex;

        for (dataIndex in data) {
          template = template.replace(new RegExp('{{\\s*' + dataIndex + '\\s*}}', 'gi'), data[dataIndex]);
        }

        return template;
      });
    }
  });


  // MODELS
  test('loads model', function() {
    expect(6);

    // Make sure the model is loaded
    ok(testAndraia.hasModel('testModel'), 'Model should be properly loaded into memory in the framework.');

    // Load the model
    var testModel = testAndraia.loadModel('testModel');

    // Check public property
    ok(testModel.passesTest, 'Public property shoud be accessible and have a true value.');
    strictEqual(typeof testModel.localProperty, 'undefined', 'Should not have access to local properties within the model.');
    
    // Test shouldPassTest model method
    ok(!!testModel.shouldPassTest(true), 'Public method should return true with a truthy argument.');
    strictEqual(!!testModel.shouldPassTest(), false, 'Public method should return false with a falsy argument, like nothing.');
    
    // Test altering model properties
    testModel.setTestToFail();
    strictEqual(!!testModel.passesTest, false, 'Public property should be false after manipulation.');
  });


  // TEMPLATES
  test('loads template', function(){
    expect(1);
    
    // Grab the test template from the HTML
    var template = $('#test-template').html();
    // Compile the test template using the template defined in the setup
    template = testAndraia.template(template, {'item': 'butterknife'});
    // Display the compiled template in the game cube (main container)
    $('#game-cube').html(template);

    strictEqual(template, '<div><p>Prepare to taste the wrath of my... butterknife?</p></div>', 'Template chould compile {{item}} into butterknife');
  });

}(jQuery));
