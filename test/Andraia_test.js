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

  var testContainerId = '#game-cube';

  var testAndraia = new Andraia(testContainerId, {
    'enableRouter': false,
    'enablePageslider': false
  });


  // MODELS --------------------------------------------------------------/
  module('Andraia Models', {
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

  test('Check that model was properly registered', function() {
    expect(1);
    // Make sure the model is loaded
    ok(testAndraia.hasModel('testModel'), 'Model should be properly loaded into memory in the framework.');
  });

  test('Check model properties and methods', function() {
    expect(5);

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


  // TEMPLATES ------------------------------------------------------------/
  module('Andraia Templates', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();

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

  test('Check that the custom template method compiles data properly into the template markup', function(){
    expect(1);
    
    // Grab the test template from the HTML
    var template = $('#test-template').html();
    // Compile the test template using the template defined in the setup
    template = testAndraia.template(template, {'item': 'butterknife'});
    // Display the compiled template in the game cube (main container)
    $(testContainerId).html(template);

    strictEqual(template, '<div><p>"Prepare to taste the wrath of my... butterknife?"</p></div>', 'Template chould compile {{item}} into butterknife');
  });

  // VIEWS ------------------------------------------------------------/
  module('Andraia Views', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();

      // Reset the game cube (which is just a fancy ID on our app container element)
      $('#game-cube').html('');

      // Register a simple view with no data
      testAndraia.registerView('test-view1', function() {
        $('#game-cube p').last().after('<p>"Free for only $99,99,99!"</p>');
      });

      // Register a view with data to compile
      testAndraia.registerView('test-view2', function() {
        $('#game-cube p').last().after('<p>Cecil: "Tea? Earl Grey? Hot? What in the net is that?"</p>');
      }, {
        "character": "Captain Capacitor",
        "quote": "Shiver me templates!"
      });
    }
  });

  test('Does the loaded view properly render', function(){
    expect(1);
    testAndraia.loadView('test-view1');
    strictEqual($(testContainerId).html(), '<div><h1>Mike the TV</h1><p>"Bucket-o-nothing"</p><p>"Free for only $99,99,99!"</p></div>', 'The app view should contain markup from the view plus markup added from within the controller.');
  });

  test('Does the loaded view properly render and compile data', function(){
    expect(1);
    testAndraia.loadView('test-view2');
    strictEqual($(testContainerId).html(), '<div><p>Captain Capacitor: "Shiver me templates!"</p><p>Cecil: "Tea? Earl Grey? Hot? What in the net is that?"</p></div>', 'The app view should contain compiled markup from the view plus markup added from within the controller.');
  });

}(jQuery));
