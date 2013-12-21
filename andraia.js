function Andraia(elementContainerId) {

  var error = null, debugError = null;

  var getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    
    if ($(id).size() > 0) {
      return id;
    }

    return null;
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
      this.models[modelName] = modelFunction;
      console.log('Models registered',this.models);
    }

    if (!modelFunction && $.isFunction(this.models[modelName])) {
      modelLoaded = new this.models[modelName]();
      return modelLoaded;
    }
  };

  this.helpers = {};
  this.injectHelper = function(name, helperFunction) {
    this.helpers[name] = helperFunction;
  };

  this.controllers = {};

  this.view = function(viewName, controllerFunction, data) {

    var _template, _controller, _templateEngine;

    // Load this as a controller if it is a function and isn't already loaded
    if ($.isFunction(controllerFunction) && ($(this.controllers).size() < 1 || !$.isFunction(this.controllers[viewName]))) {
      this.controllers[viewName] = controllerFunction;
    }

    elementIdentifier = getElementId(viewName);

    if (!elementIdentifier) {
      this.error('No element id ' + id + ' found');
    }

    _template = $(elementIdentifier).html();

    $(elementContainerId).html(this.template(_template, data));

    if ($(this.controllers).size() > 0 && $.isFunction(this.controllers[viewName])) {
      _controller = new this.controllers[viewName](this.helpers);
    }
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
      this.error('No template engine loaded');
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
