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
function Andraia(elementContainerId, userSettings) {

  var self = this,
      defaultSettings = {},
      settings = {},
      getElementId,
      slider,
      _templateEngine,
      _templateHeader = '',
      _templateFooter = '',
      _loadedTemplate = '',
      error = null, 
      debugError = null;

  defaultSettings = {
    'templateDirectory': 'templates/',
    
    'enablePageslider': true,
    'enableFastclick': true,
    'enableRouter': true,

    'templateEngine': '',

    'pageTransitionSpeed': 0.25
  };

  $.extend(settings, defaultSettings, userSettings);

  // Data in memory
  this.controllers = {};
  this.models = {};
  this.helpers = {};
  this.templateData = {};

  
  // Adds a hash to an element ID if it is not there for jQuery selectors
  getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    return id;
  };

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
    var _elementId = getElementId(id),
        deferred = $.Deferred();

    if ($(_elementId).size() > 0) {
      // Load the template into memory
      _loadedTemplate = $(_elementId).html();

      deferred.resolve();
      return deferred;
    }

    // Example URL: templates/newView.html
    $.get(settings.templateDirectory + _elementId.substr(1) + '.html', function(html) {
      _loadedTemplate = html;
      $('body').append('<script id="'+_elementId.substr(1)+'" type="text/html">'+html+'</script>');
      deferred.resolve();
    });

    return deferred;
  };


  // This is where we store laoded templates
  loadTemplate2 = function(id) {
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

    // The html file should be based on the ID
    var htmlFilename = id;

    // The filename should not have a hash symbol
    if (htmlFilename.indexOf('#') === 0) {
      htmlFilename = htmlFilename.substr(1);
    }

    $.get(settings.templateDirectory + htmlFilename + '.html', function(html) {
      _templateCache[id] = html;
      deferred.resolve();
    });

    return deferred;
  };


  this.registerView = function(viewName, controllerFunction, data) {

    viewName = getElementId(viewName);

    // If the action item is a function then it must be a controller.
    // Add the controller function to memory
    if ($.isFunction(controllerFunction)){ // && ($(self.controllers).size() < 1 || !$.isFunction(self.controllers[viewName]))) {
      self.controllers[viewName] = controllerFunction;
    }

    if (!!data) {
      self.templateData[viewName] = data;
    }
  };


  // The generic view method for loading views and storing controllers
  this.view = function(viewName, controllerFunction, data) {

    var _template, _controller;

    viewName = getElementId(viewName);

    // If the action item is a function then it must be a controller.
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
      // _template = self.templates[viewName];
      // Run the templating engine on the template using any user-defined data
      _loadedTemplate = self.template(_loadedTemplate, self.templateData[viewName]);
      // Slide the page to this view
      slider.slidePage($(_loadedTemplate), "left");
      // If there is a controller for this view, load it
      if ($(self.controllers).size() > 0 && $.isFunction(self.controllers[viewName])) {
        _controller = new self.controllers[viewName](self.helpers);
      }
    });
  };

  // Shortcut to view specifically for loading a view
  this.loadView = function(viewName) {
    viewName = getElementId(viewName);

    if (settings.enableRouter && !self.router.currentPage || self.router.currentPage !== viewName) {
      window.location.hash = viewName;
    }

    if (settings.enablePageslider && !slider) {
      slider = new PageSlider($(elementContainerId));
    }
    // Load the template. When the template is loaded we will apply any 
    // templating as necessary and load the controller for the view
    loadTemplate(viewName).done(function(){
      // Run the templating engine on the template using any user-defined data
      _loadedTemplate = self.template(_loadedTemplate, self.templateData[viewName]);
      // Slide the page to this view
      slider.slidePage($(_loadedTemplate), "left");
      // If there is a controller for this view, load it
      if ($(self.controllers).size() > 0 && $.isFunction(self.controllers[viewName])) {
        _controller = new self.controllers[viewName](self.helpers);
      }
    });
  };


  // Define how the template is to be rendered. 
  _templateEngine = function(template, data) {

    if (!data) return template;

    function isEngine(engineType) {
      // Get the lowercase version of the template engine name (for consistency)
      usersTemplateEngine = settings.templateEngine.toLowerCase();
      // Check for this engine type in the users selected template engine
      // E.g. search for "mustache in Mustache.js"
      return usersTemplateEngine.indexOf(engineType) >= 0;
    }

    // Use Underscore's templating
    if (typeof _ !== "undefined" && $.isFunction(_) && isEngine('underscore')) {
      var compiled = _.template(template);
      return compiled(data);
    }

    // Use Handlebar's templating
    if (typeof Handlebars !== "undefined" && isEngine('handlebars')) {
      var compiled = Handlebars.compile(template);
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


  if (!elementContainerId) elementContainerId = 'body';
  else elementContainerId = getElementId(elementContainerId);

  if (settings.enableFastclick) {
    window.addEventListener('load', function () {
      new FastClick(document.body);
    }, false);
  }


  this.router = {
    currentPage: window.location.hash,
    changePage: function (pageId) {
      pageId = getElementId(pageId);

      // If there is no current page we do not want to load the view until the app is ready.
      if (!!self.router.currentPage) {
        self.loadView(pageId);
      }

      if (!self.router.currentPage || self.router.currentPage === pageId) {
        window.location.hash = pageId;
      }

      self.router.currentPage = pageId;
    }
  };

  if (settings.enableRouter) {
    var pageHash = '';

    window.addEventListener('hashchange', function () {
      var changePage = self.router.changePage;
      pageHash = window.location.hash;
      if (!!pageHash) 
        changePage(pageHash);
    });
  }

  if (settings.pageTransitionSpeed != defaultSettings.pageTransitionSpeed) {
    // Add styles to overwrite the page transition speed at the end of the head
    // The default is 0.25. 
    // Don't bother with the overwrite if the user is using the default
    $('head').append(' ' +
      '<style>' +
      '  .page.transition {' +
      '    -webkit-transition-duration: ' + settings.pageTransitionSpeed + 's;' +
      '    transition-duration: ' + settings.pageTransitionSpeed + 's;' +
      '  }' +
      '</style>');
  }
}
