/*! Andraia - v0.1.0 - 2014-01-21
* https://github.com/grevory/andraia-js-mobile-framework
* Copyright (c) 2014 ; Licensed MIT */
/* Use the following comments to define global variables for tests */
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
    // Data stored in memory for the MVC
    _controllers = {}, _models = {}, _helpers = {}, _templateData = {},      
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
  
  // Adds a hash to an element ID if it is not there for jQuery selectors
  _getElementId = function(id) {
    if (id.charAt(0) !== '#') {
      return '#' + id;
    }
    return id;
  };

  if (_settings.enableRouter) {
    var _history = [];
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

  // Add a model to memory
  // Shortcut to model()
  this.registerModel = function(modelName, modelFunction) {
    if ($.isFunction(modelFunction)) {
      _models[modelName] = modelFunction;
    }
  };

  // Grab the model for your app
  this.loadModel = function(modelName) {
    if ($.isFunction(_models[modelName])) {
      return new _models[modelName](_helpers);
    }
  };

  // Check to see if a model is already loaded
  this.hasModel = function(modelName) {
    return !!_models[modelName];
  };


  // Add helpers to memory for reusable functions
  this.registerHelper = function(name, helperFunction) {
    if ($.type(name) !== "string") {
      return _self._error('Could not register helper. The name is not a string.');
    }

    if ($.type(helperFunction) !== "function") {
      return _self._error('Could not register helper. The function is not a function.');
    }

    _helpers[name] = helperFunction;
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
    if ($.isFunction(controllerFunction)){
      _controllers[viewName] = controllerFunction;
    }

    if (!!data) {
      _templateData[viewName] = data;
    }
  };


  function loadController(viewName) {
    // Check to see if there is a controller for this view and then load it
    if ($(_controllers).size() > 0 && $.isFunction(_controllers[viewName])) {
      _controller = new _controllers[viewName](_helpers);
    }

    // If there is a data returned from the controller we assume it is meant to be used for template
    if (!$.isEmptyObject(_controller)) {
      return _controller;
    }
    // There was no data from the controller but their might be data registered for this view
    return _templateData[viewName];
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


  // Shortcut to view specifically for loading a view
  this.loadView = function(viewName) {
    viewName = _getElementId(viewName);

    if (_settings.enableRouter) {
      // Change the hash on load if necessary
      if (!_self.router.currentPage || _self.router.currentPage !== viewName) {
        window.location.hash = viewName;
      }
      // If this is the first load and no hashchange is needed, start the history
      else if (!!_history && !_history.length) {
        _history.push(viewName);
      }
    }

    if (_settings.enablePageslider && $.isFunction(PageSlider) && !_slider) {
      _slider = new PageSlider($(elementContainerId));
    }

    // Load the template. When the template is loaded we will apply any 
    // templating as necessary and load the controller for the view
    _loadTemplate(viewName).done(function() {
      
      resetBindings();

      _data = _templateData[viewName];
      if ($.isFunction(_data)) {
        _data = _data();
        _templateData[viewName] = _data;
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

      _self.router.addToHistory(pageHash);

      // If there is no current page we do not want to load the view until the app is ready.
      if (!!_self.router.currentPage) {
        _self.loadView(pageId);
      }

      if (!_self.router.currentPage || _self.router.currentPage === pageId) {
        window.location.hash = pageId;
      }

      _self.router.currentPage = pageId;
    },
    addToHistory: function(pageHash) {
      if (_history.length >= _settings.maxHistory) {
        _history = _history.slice(1);
      }
      _history.push(pageHash);
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

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
	'use strict';
	var oldOnClick, self = this;


	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	if (!layer || !layer.nodeType) {
		throw new TypeError('Layer must be a document node');
	}

	/** @type function() */
	this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

	/** @type function() */
	this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

	/** @type function() */
	this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

	/** @type function() */
	this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

	/** @type function() */
	this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return;
	}

	// Set up event handlers as required
	if (this.deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'button':
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if (this.deviceIsIOS && target.type === 'file') {
			return true;
		}

		// Don't send a synthetic click to disabled inputs (issue #62)
		return target.disabled;
	case 'label':
	case 'video':
		return true;
	default:
		return (/\bneedsclick\b/).test(target.className);
	}
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
	case 'select':
		return true;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	if (this.deviceIsIOS && targetElement.setSelectionRange) {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (this.deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!this.deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}
		
			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0];

	if (Math.abs(touch.pageX - this.touchStartX) > 10 || Math.abs(touch.pageY - this.touchStartY) > 10) {
		return true;
	}

	return false;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	// If the touch has moved, cancel the click tracking
	if (this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		this.cancelNextClick = true;
		return true;
	}

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (this.deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset);
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (this.deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!this.deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (this.deviceIsIOS && !this.deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		var self = this;
		setTimeout(function(){
			self.sendClick(targetElement, event);
		}, 0);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (this.deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
	'use strict';
	return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
}

function PageSlider(container) {

    var container = container,
        currentPage,
        stateHistory = [];

    // Use this function if you want PageSlider to automatically determine the sliding direction based on the state history
    this.slidePage = function(page) {

        var l = stateHistory.length,
            state = window.location.hash;

        if (l === 0) {
            stateHistory.push(state);
            this.slidePageFrom(page);
            return;
        }
        if (state === stateHistory[l-2]) {
            stateHistory.pop();
            this.slidePageFrom(page, 'left');
        } else {
            stateHistory.push(state);
            this.slidePageFrom(page, 'right');
        }

    }

    // Use this function directly if you want to control the sliding direction outside PageSlider
    this.slidePageFrom = function(page, from) {

        container.append(page);

        if (!currentPage || !from) {
            page.attr("class", "page center");
            currentPage = page;
            return;
        }

        // Position the page at the starting position of the animation
        page.attr("class", "page " + from);

        currentPage.on('webkitTransitionEnd mozTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(e) {
            $(e.target).remove();
        });

        // Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
        container[0].offsetWidth;

        // Position the new page and the current page at the ending position of their animation with a transition class indicating the duration of the animation
        page.attr("class", "page transition center");
        currentPage.attr("class", "page transition " + (from === "left" ? "right" : "left"));
        currentPage = page;
    }

}