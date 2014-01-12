# Andraia

A lightweight JS framework for building simple mobile HTML5 applications

## Getting Started
<!--### On the server
Install the module with: `npm install Andraia`

```javascript
var Andraia = require('Andraia')('game-cube', { enableRouter: false }); // Does not work
```

### In the browser-->
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/grevory/andraia-js-mobile-framework/master/src/Andraia.min.js
[max]: https://raw.github.com/grevory/andraia-js-mobile-framework/master/src/Andraia.js

The files you need to start working are in the src folder. It even includes the dependencies except for jQuery.

In your web page you can attach Andraia's methods to any object.

```html
<div id="game-cube"></div>
<script src="src/Andraia.min.js"></script>
<script>
var myApp = new Andraia('game-cube');
</script>
```

## Documentation
Loading Andraia
---------------

You need an element with an id attribute in order for Andraia to work. The element is where all the views will be loaded.

```html
<div id="game-cube"></div>
```

With that element in place (You can use whatever id you like), you can initiate the framework.

```javascript
var myApp = new Andraia('game-cube');
```


Models
------

Models are easy.

```javascript
myApp.registerModel('User', function() {

  // To illustrate which elements within this function are private 
  // and which are public they have been named accordingly. These 
  // names are not required.
  var _public = {},
    _private = {};
  
  // Initiate the model with some properties
  _private.firstName = "Enzo";
  _private.lastName = "Matrix";

  _public.fullName = function() {
    return _private.firstName + ' ' + _private.lastName;
  };

  // It is important you return an object with the properties and 
  // methods which are publically accessible.
  return _public;
});
```

A model is essentially a javascript function. It can contain public and private properties. As long as it is returned in an object, it is accessible where that model is loaded.

To load a model:

```javascript
var user = myApp.loadModel('User');
console.log("User's name:", user.fullName() );
```

As long as your model is a function and it returns something you can design it however you like.

Views
-----

You can load a view with a controller for each page of your app.

The template can come from your HTML

```html
<script id="loginView" type="text/html">
  <form>
    <div>
      <label>E-mail</label>
      <input
        type="text"
        name="email">
    </div>
    <div>
      <label>Password</label>
      <input
        type="password"
        name="password">
    </div>
    <button type="submit">
      Log in
    </button>
  </form>
</script>
```

The first parameter is the name of the ID of the HTML element.

The second parameter is the controller function that will handle bindings and data.

```javascript
var loginCtrl = function() {
  $('[name=email]').blur(function(e){
    console.log($('[name=email]').val());
  });
};
app.view('loginView', loginCtrl);
```

Templating
----------

You can actually use whatever you for templating. In fact, Andraia supports basic templating for Underscore, Mustache, Handlebars, and EJS out of the box. To enable templating for on of the options above:

```javascript
var myApp = new Andraia('game-cube', {'enableUnderscore': true});
```

Let's say you wish to write your own function to compile your templates.

```javascript
myApp.registerTemplating(function(template, data){
  var dataIndex, regexPattern;

  for (dataIndex in data) {
    regexPattern = new RegExp('{{\\s*' + dataIndex + '\\s*}}', 'gi');
    template = template.replace(regexPattern, data[dataIndex]);
  }

  return template;
});
```

The template function takes two parameters always. The HTML as a string and data as an object.

By adding the template function Andraia will automatically render the template substituing your template values. Using the example above

In your HTML template

```html
<div id="loginView">
  <p>Welcome <%= format %></p>
</div>
```

```javascript
var loginCtrl = function() {
  $('[name=email]').focus(function(e){
    console.log($('[name=email]').val());
  });
};
var loginData = {
  "format": "Game Sprite"
};
app.view('loginView', loginCtrl, loginData);
```

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Gregory Pike
Licensed under the MIT license.
