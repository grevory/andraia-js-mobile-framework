/**
 * Andraia
 * A lightweight javascript MVC framework for building simple mobile apps.
 *
 * version 0.0.1
 * MIT License (see LICENSE.txt)
 *
 * Instantiate Andraia on a container element
 *
 * elementContainerId: The ID attribute of the container element
 */
function Andraia(elementContainerId) {

  var self = this,
      defaultSettings = {},
      userSettings = {},
      getElementId,
      _templateEngine,
      error = null, 
      debugError = null;

  defaultSettings = {
    'templateDirectory': 'templates/'
  }

  // Data in memory
  this.controllers = {};
  this.models = {};
  this.helpers = {};
  this.templates = {};

  
  // Adds a hash to an element ID if it is not there for jQuery selectors
  getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    return id;
  };

  elementContainerId = getElementId(elementContainerId);


  // Handle errors in the app
  this.error = function(errorMessage, debugMessage) {
    if (!errorMessage) {
      return error;
    }
    error = errorMessage;
    debugError = debugMessage;
    console.error(debugMessage || errorMessage);
    // alert(errorMessage);
  };


  // Model
  // A generic function for handling models
  this.model = function(modelName, modelFunction) {

    var modelLoaded = null;

    if ($.isFunction(modelFunction)) {
      self.models[modelName] = modelFunction;
      console.log('Models registered',self.models);
    }

    if (!modelFunction && $.isFunction(self.models[modelName])) {
      modelLoaded = new self.models[modelName]();
      return modelLoaded;
    }
  };

  // Add a model to memory
  // Shortcut to model()
  this.createModel = function(modelName, modelFunction) {
    return self.model(modelName, modelFunction);
  };

  // Grab the model for your app
  this.loadModel = function(modelName) {
    return self.model(modelName);
  };


  // Add helpers to memory for reusable functions
  this.injectHelper = function(name, helperFunction) {
    self.helpers[name] = helperFunction;
  };


  // This is where we store laoded templates
  loadTemplate = function(id) {
    var _templateCache = self.templates,
        _elementId = getElementId(id),
        deferred = $.Deferred();

    if (_templateCache[id]) {
      deferred.resolve();
      return deferred;
    }

    if ($(_elementId).size() > 0) {
      // Load the template into memory
      _templateCache[id] = $(_elementId).html();
      deferred.resolve();
      return deferred;
    }

    $.get(defaultSettings.templateDirectory + id + '.html', function(html) {
      _templateCache[id] = html;
      deferred.resolve();
    });

    return deferred;
  };


  // The generic view method for loading views and storing controllers
  this.view = function(viewName, controllerFunction, data) {

    var _template, _controller;

    // Add the controller function to memory
    if ($.isFunction(controllerFunction) && ($(self.controllers).size() < 1 || !$.isFunction(self.controllers[viewName]))) {
      self.controllers[viewName] = controllerFunction;
    }

    // Load the template. When the template is loaded we will apply any 
    // templating as necessary and load the controller for the view
    loadTemplate(viewName).done(function(){
      _template = self.templates[viewName];
      // Put the template in the main container element
      $(elementContainerId).html(self.template(_template, data));
      // If there is a controller for this view, load it
      if ($(self.controllers).size() > 0 && $.isFunction(self.controllers[viewName])) {
        _controller = new self.controllers[viewName](self.helpers);
      }
    });
  };

  // Shortcut to view specifically for adding controllers to memory
  this.createController = function(viewName, controllerFunction) {
    return self.view(viewName, controllerFunction);
  };

  // Shortcut to view specifically for loading a view
  this.loadView = function(viewName) {
    return self.view(viewName);
  };


  // Define how the template is to be rendered. 
  _templateEngine = function(template, data) {
    // Use Underscore's templating
    if ($.isFunction(_)) {
      return function(template, data) {
        var compiled = _.template(template);
        return compiled(data);
      };
    }
  }


  // A generic function for handling templates
  this.template = function(template, data) {
    // Set the template engine if a function is passed
    if ($.isFunction(template)) {
      _templateEngine = template;
      return;
    }

    if (!_templateEngine) {
      self.error('No template engine loaded');
    }

    if (!template) {
      return '';
    }

    if (!data) {
      return template;
    }

    return _templateEngine(template, data);
  };

  // A shortcut for adding templating to the app
  this.injectTemplating = function(templateFunction) {
    return self.template(templateFunction);
  };
}
