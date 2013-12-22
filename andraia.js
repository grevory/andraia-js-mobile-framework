function Andraia(elementContainerId) {

  var self = this,
      defaultSettings = {},
      userSettings = {},
      getElementId,
      error = null, 
      debugError = null;

  defaultSettings = {
    'templateDirectory': 'templates/'
  }

  getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    return id;
  };

  elementContainerId = getElementId(elementContainerId);

  this.error = function(errorMessage, debugMessage) {
    if (!errorMessage) {
      return error;
    }
    error = errorMessage;
    debugError = debugMessage;
    console.error(debugMessage || errorMessage);
    // alert(errorMessage);
  };

  this.models = {};

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

  this.helpers = {};
  this.injectHelper = function(name, helperFunction) {
    self.helpers[name] = helperFunction;
  };

  this.controllers = {};

  // This is where we store laoded templates
  this.templates = {};

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

     console.log('there?',_templateCache[id], !!_templateCache[id]);
    if (!_templateCache[id]) {
      self.error('Could not load template');
    }
    return _templateCache[id];
  };

  this.view = function(viewName, controllerFunction, data) {

    var _template, _controller, _templateEngine;

    // Load this as a controller if it is a function and isn't already loaded
    if ($.isFunction(controllerFunction) && ($(self.controllers).size() < 1 || !$.isFunction(self.controllers[viewName]))) {
      self.controllers[viewName] = controllerFunction;
    }

    loadTemplate(viewName).done(function(){
      console.log('loadTemplate() done', self.templates[viewName]);
      _template = self.templates[viewName];
      $(elementContainerId).html(self.template(_template, data));
      if ($(self.controllers).size() > 0 && $.isFunction(self.controllers[viewName])) {
      _controller = new self.controllers[viewName](self.helpers);
    }
    });
  };

  _templateEngine = function(template, data) {
    if ($.isFunction(_)) {
      return function(template, data) {
        var compiled = _.template(_template);
        return compiled(data);
      };
    }
  }

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
}
