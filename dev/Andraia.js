/*
 * Andraia
 * A lightweight javascript MVC framework for building simple mobile apps.
 * https://github.com/grevory/andraia-js-mobile-framework
 *
 * Copyright (c) 2014 Gregory Pike
 * Licensed under the MIT license.
 */

/* global $:false */
/* global console:false */
/* global window:false */
/* global PageSlider:false */
/* global _:false */
/* global Handlebars:false */
/* global Mustache:false */
/* global EJS:false */
/* global FastClick:false */

function Andraia(elementContainerId, userSettings) {

  // Variables prefixed with underscores (_) are used throughout the app
  // but are not accessible outside of Andraia
  var _self = this,
      // Settings vars
      _defaultSettings = {}, _settings = {},
      // The ID value of the element container
      _getElementId = null,
      // The PageSlide var
      _slider = null,
      // Loading templates
      _loadTemplate = null, _loadedTemplate = '',
      // Templating vars
      _templateEngine = null, _templateHeader = '', _templateFooter = '',
      // Data and controller vars
      _data = null, _controller = null, _bindings = [],
      // Error vars
      _error = null, _debugError = null;

  _defaultSettings = {
    // The directory for storing templates to be loaded as views
    'templateDirectory': 'templates/',
    // PageSlider is a script for hardware-accelerated CSS transitions
    'enablePageslider': true,
    // PageSlide uses FastClick
    'enableFastclick': true,
    // Use an automatic router by default
    // Turn it off to use your own
    'enableRouter': true,
    // Maximum number of hashes to be stored in history
    // We don't want to store too much in memory
    'maxHistory': 8,
    // Could be Underscore, Handlebars, Mustache, 
    'templateEngine': '',
    // How fast pages transition
    'pageTransitionSpeed': 0.25
  };

  $.extend(_settings, _defaultSettings, userSettings);

  // Data in memory
  this.controllers = {};
  this.models = {};
  this.helpers = {};
  this.templateData = {};

  
  // Adds a hash to an element ID if it is not there for jQuery selectors
  _getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    return id;
  };

  if (_settings.enableRouter) {
    var _history = [];

    function addToHistory(pageHash) {
      if (_history.length >= _settings.maxHistory) {
        _history = _history.slice(1);
      }
      _history.push(pageHash);
    }
  }

  // Handle _errors in the app
  this.error = function(errorMessage, debugMessage) {
    if (!errorMessage) {
      return _error;
    }
    _error = errorMessage;
    _debugError = debugMessage;
    console.error(debugMessage || errorMessage);
    // alert(_errorMessage);
  };


  // Model
  // A generic function for handling models
  this.model = function(modelName, modelFunction) {

    var modelLoaded = null;

    if ($.isFunction(modelFunction)) {
      _self.models[modelName] = modelFunction;
    }

    if (!modelFunction && $.isFunction(_self.models[modelName])) {
      modelLoaded = new _self.models[modelName](_self.helpers);
      return modelLoaded;
    }
  };

  // Add a model to memory
  // Shortcut to model()
  this.registerModel = function(modelName, modelFunction) {
    return _self.model(modelName, modelFunction);
  };

  // Grab the model for your app
  this.loadModel = function(modelName) {
    return _self.model(modelName);
  };

  // Check to see if a model is already loaded
  this.hasModel = function(modelName) {
    return !!_self.models[modelName];
  };


  // Add helpers to memory for reusable functions
  this.registerHelper = function(name, helperFunction) {
    if ($.type(name) !== "string") {
      return _self._error('Could not register helper. The name is not a string.');
    }

    if ($.type(helperFunction) !== "function") {
      return _self._error('Could not register helper. The function is not a function.');
    }

    _self.helpers[name] = helperFunction;
  };


  // This is where we store laoded templates
  _loadTemplate = function(id) {
    var _elementId = _getElementId(id),
        deferred = $.Deferred();

    if ($(_elementId).size() > 0) {
      // Load the template into memory
      _loadedTemplate = $(_elementId).html();

      deferred.resolve();
      return deferred;
    }

    // Example URL: templates/newView.html
    $.get(_settings.templateDirectory + _elementId.substr(1) + '.html', function(html) {
      _loadedTemplate = html;
      $('body').append('<script id="'+_elementId.substr(1)+'" type="text/html">'+html+'</script>');
      deferred.resolve();
    });

    return deferred;
  };


  this.registerView = function(viewName, controllerFunction, data) {

    viewName = _getElementId(viewName);

    // If the action item is a function then it must be a controller.
    // Add the controller function to memory
    if ($.isFunction(controllerFunction)){ // && ($(_self.controllers).size() < 1 || !$.isFunction(_self.controllers[viewName]))) {
      _self.controllers[viewName] = controllerFunction;
    }

    if (!!data) {
      _self.templateData[viewName] = data;
    }
  };


  function loadController(viewName) {
    // Check to see if there is a controller for this view and then load it
    if ($(_self.controllers).size() > 0 && $.isFunction(_self.controllers[viewName])) {
      _controller = new _self.controllers[viewName](_self.helpers);
    }

    // If there is a data returned from the controller we assume it is meant to be used for template
    if (!$.isEmptyObject(_controller)) {
      return _controller;
    }
    // There was no data from the controller but their might be data registered for this view
    return _self.templateData[viewName];
  }


  this.bind = function(selector, bindType, callbackFtn) {
    _bindings.push({
      'selector': selector,
      'bindType': bindType,
      'callbackFtn': callbackFtn
    });
  };

  function resetBindings() {
    this.bindings = [];
  }


  // The generic view method for loading views and storing controllers
  // this.view = function(viewName, controllerFunction, data) {

  //   var _template;

  //   viewName = _getElementId(viewName);

  //   // If the action item is a function then it must be a controller.
  //   // Add the controller function to memory
  //   if ($.isFunction(controllerFunction)){ // && ($(_self.controllers).size() < 1 || !$.isFunction(_self.controllers[viewName]))) {
  //     _self.controllers[viewName] = controllerFunction;
  //   }

  //   if (!!data) {
  //     _self.templateData[viewName] = data;
  //   }

  //   // Load the template. When the template is loaded we will apply any 
  //   // templating as necessary and load the controller for the view
  //   _loadTemplate(viewName).done(function(){
  //     // Run the templating engine on the template using any user-defined data
  //     _loadedTemplate = _self.template(_loadedTemplate, _data);
  //     // Slide the page to this view
  //     _slider.slidePage($(_loadedTemplate), "left");

  //     // If there is a controller for this view, load it
  //     _data = loadController(viewName);

  //     if (_bindings[viewName]){
  //       $.each(_bindings[viewName], function(i,v) {
  //         console(i,v);
  //       })
  //     }
  //   });
  // };

  // Shortcut to view specifically for loading a view
  this.loadView = function(viewName) {
    viewName = _getElementId(viewName);

    if (_settings.enableRouter && !_self.router.currentPage || _self.router.currentPage !== viewName) {
      window.location.hash = viewName;
    }

    if (_settings.enablePageslider && $.isFunction(PageSlider) && !_slider) {
      _slider = new PageSlider($(elementContainerId));
    }

    // Load the template. When the template is loaded we will apply any 
    // templating as necessary and load the controller for the view
    _loadTemplate(viewName).done(function() {
      
      resetBindings();

      _data = _self.templateData[viewName];
      if ($.isFunction(_data)) {
        _data = _data();
        _self.templateData[viewName] = _data;
      }

      // Run the templating engine on the template using any user-defined data
      _loadedTemplate = _self.template(_loadedTemplate, _data);
      
      // Slide the page to this view
      if (!!_slider) {
        _slider.slidePage($(_loadedTemplate), "left");
      } else {
        $(elementContainerId).html(_loadedTemplate);
      }

      loadController(viewName);

      // $(elementContainerId).html(_self.template($(elementContainerId).html(), _data));

      $.each(_bindings, function(id, binding) {
        $(binding.selector).unbind(binding.bindType + '.' + viewName);
        $(binding.selector).bind(binding.bindType + '.' + viewName, binding.callbackFtn);
      });
    });
  };


  // Define how the template is to be rendered. 
  _templateEngine = function(template, data) {

    if (!data) {
      return template;
    }

    var compiled;

    function isEngine(engineType) {
      // Get the lowercase version of the template engine name (for consistency)
      var usersTemplateEngine = _settings.templateEngine.toLowerCase();
      // Check for this engine type in the users selected template engine
      // E.g. search for "mustache in Mustache.js"
      return usersTemplateEngine.indexOf(engineType) >= 0;
    }

    // Use Underscore's templating
    if (typeof _ !== "undefined" && $.isFunction(_) && isEngine('underscore')) {
      compiled = _.template(template);
      return compiled(data);
    }

    // Use Handlebar's templating
    if (typeof Handlebars !== "undefined" && isEngine('handlebars')) {
      compiled = Handlebars.compile(template);
      template = compiled(data);
    }

    // Use Mustache's templating
    if (typeof Mustache !== "undefined" && isEngine('mustache')) {
      template = Mustache.render(template, data);
    }

    if (typeof EJS !== "undefined" && isEngine('ejs')) {
      template = new EJS({text: template}).render(data);
    }

    return template;
  };


  // A generic function for handling templates
  this.template = function(template, data) {
    // Set the template engine if a function is passed
    if ($.isFunction(template)) {
      _templateEngine = template;
      return;
    }

    if (!_templateEngine) {
      _self._error('No template engine loaded');
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
  this.registerTemplating = function(templateFunction) {
    return _self.template(templateFunction);
  };


  var extractTemplate = function(htmlString) {
    // Convert header HTML to string
    htmlString = "" + htmlString;

    if (htmlString.indexOf('.html') > -1) {
      _self._error('This option is not yet available. Cannot load header or footer template from external file.');
      return console.log('Go get template');
    }

    // If there are no HTML tags and the headerHtml string is the id of an element let's get the HTML of that element
    if (htmlString.indexOf('<') < 0 && $(_getElementId(htmlString)).size() > 0) {
      htmlString = $(_getElementId(htmlString)).html();
    }

    return htmlString;
  };


  this.registerTemplateHeader = function(headerHtml) {
    _templateHeader = extractTemplate(headerHtml);
  };


  this.registerTemplateFooter = function(footerHtml) {
    _templateFooter = extractTemplate(footerHtml);
  };


  if (!elementContainerId) {
    elementContainerId = 'body';
  }
  else {
    elementContainerId = _getElementId(elementContainerId);
  }

  if (_settings.enableFastclick) {
    window.addEventListener('load', function () {
      new FastClick(window.document.body);
    }, false);
  }


  this.router = {
    currentPage: window.location.hash,
    changePage: function (pageId) {
      pageId = _getElementId(pageId);

      addToHistory(pageHash);

      // If there is no current page we do not want to load the view until the app is ready.
      if (!!_self.router.currentPage) {
        _self.loadView(pageId);
      }

      if (!_self.router.currentPage || _self.router.currentPage === pageId) {
        window.location.hash = pageId;
      }

      _self.router.currentPage = pageId;
    },
    goBack: function() {
      // If there is no history to go back don't bother trying to change the page
      if (!_history || !_history.length || _history.length <= 1) {
        return;
      }
      // We get -2 of the length because we want the last item in history and
      // JS arrays are 0-indexed
      window.location.hash = _history[_history.length - 2];
    }
  };

  if (_settings.enableRouter) {
    var pageHash = '';

    window.addEventListener('hashchange', function () {
      var changePage = _self.router.changePage;
      pageHash = window.location.hash;
      if (!!pageHash) {
        changePage(pageHash);
      }
    });
  }

  if (_settings.pageTransitionSpeed !== _defaultSettings.pageTransitionSpeed) {
    // Add styles to overwrite the page transition speed at the end of the head
    // The default is 0.25. 
    // Don't bother with the overwrite if the user is using the default
    $('head').append(' ' +
      '<style>' +
      '  .page.transition {' +
      '    -webkit-transition-duration: ' + _settings.pageTransitionSpeed + 's;' +
      '    transition-duration: ' + _settings.pageTransitionSpeed + 's;' +
      '  }' +
      '</style>');
  }
}
