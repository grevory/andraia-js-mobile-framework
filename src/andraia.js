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
      slider,
      _templateEngine,
      _templateHeader = '',
      _templateFooter = '',
      error = null, 
      debugError = null;

  defaultSettings = {
    'templateDirectory': 'templates/',
    
    'enablePageslider': true,
    'enableFastclick': true,

    'useUnderscoreTemplating': true,

    'pageTransitionSpeed': 0.5
  };

  // Data in memory
  this.controllers = {};
  this.models = {};
  this.helpers = {};
  this.templates = {};
  this.templateData = {};

  
  // Adds a hash to an element ID if it is not there for jQuery selectors
  getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    return id;
  };

  if (!elementContainerId) elementContainerId = 'body';
  else elementContainerId = getElementId(elementContainerId);

  if (defaultSettings.enableFastclick) {
    window.addEventListener('load', function () {
      new FastClick(document.body);
    }, false);
  }

  if (defaultSettings.enablePageslider) {
    slider = new PageSlider($(elementContainerId));
  }

  $('link[rel=stylesheet]:last-child').after(' ' +
'<style>' +
'  .page.transition {' +
'    -webkit-transition-duration: ' + defaultSettings.pageTransitionSpeed + 's;' +
'    transition-duration: ' + defaultSettings.pageTransitionSpeed + 's;' +
'  }' +
'</style>');


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
    if ($.isFunction(controllerFunction)){ // && ($(self.controllers).size() < 1 || !$.isFunction(self.controllers[viewName]))) {
      self.controllers[viewName] = controllerFunction;
    }

    if (!!data) {
      self.templateData[viewName] = data;
    }

    // Load the template. When the template is loaded we will apply any 
    // templating as necessary and load the controller for the view
    loadTemplate(viewName).done(function(){
      // Fetch the template for this view from memory
      _template = self.templates[viewName];
      // Run the templating engine on the template using any user-defined data
      _template = self.template(_template, self.templateData[viewName]);
      // Slide the page to this view
      slider.slidePage($(_template), "left");
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

    if (!data) return template;

    // Use Underscore's templating
    if ($.isFunction(_) && defaultSettings.useUnderscoreTemplating) {
      var compiled = _.template(template);
      return compiled(data);
    }

    return template;
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

    template = '<div>' + _templateHeader + _templateEngine(template) + _templateFooter + '</div>';

    if (!data) {
      return template;
    }

    return _templateEngine(template, data);
  };

  
  // A shortcut for adding templating to the app
  this.injectTemplating = function(templateFunction) {
    return self.template(templateFunction);
  };


  var extractTemplate = function(htmlString) {
    // Convert header HTML to string
    htmlString = "" + htmlString;

    if (htmlString.indexOf('.html') > -1) {
      self.error('This option is not yet available. Cannot load header or footer template from external file.');
      return console.log('Go get template');
    }

    // If there are no HTML tags and the headerHtml string is the id of an element let's get the HTML of that element
    if (htmlString.indexOf('<') < 0 && $(getElementId(htmlString)).size() > 0) {
      htmlString = $(getElementId(htmlString)).html();
    }

    return htmlString;
  };


  this.injectTemplateHeader = function(headerHtml) {
    _templateHeader = extractTemplate(headerHtml);
  };


  this.injectTemplateFooter = function(footerHtml) {
    _templateFooter = extractTemplate(footerHtml);
  };
}
