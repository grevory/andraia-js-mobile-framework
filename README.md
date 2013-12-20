andraia-js-mobile-framework
===========================

An ultra-lightweight javascript framework for building small mobile apps the way you like

Loading Andraia
---------------

You need an element with an id attribute in order for Andraia to work. The element is where all the views will be loaded.

```html
<div id="game-cube"></div>
```

With that element in place (You can use whatever id you like), you can initiate the framework.

```javascript
var app = new Andraia('game-cube');
```


Models
------

Models are easy.

```javascript
var user = app.model('User', function() {
  this.firstName = 'Enzo';
  this.lastName = 'Matrix';
  this.fullName = function() {
    return this.firstName + ' ' + this.lastName;
  };
});
console.log("User's name", user.fullName);
```

As long as your model is a function and it returns something you can design it however you like.

Views
-----

You can load a view with a controller for each page of your app. 

The template can come from your HTML

```html
<script id="loginView" type="text/html">
  <form class="login-form" role="form">
    <p>Welcome <%= format %></p>
    <div class="form-group">
      <label>E-mail</label>
      <input 
        type="text"
        name="email"
        class="form-control"
        placeholder="E-mail">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input
        type="password"
        name="password"
        class="form-control"
        placeholder="Password">
    </div>
    <button 
      type="submit" 
      class="btn btn-default">
      Log in
    </button>
  </form>
</script>
```

The first parameter is the name of the ID of the HTML element.

The second parameter is the controller function that will handle bindings and data.

```javascript
var loginCtrl = function() {
  $('[name=email]').focus(function(e){
    console.log($('[name=email]').val());
  });
};
app.view('loginView', loginCtrl);
```

Templating
----------

You can actually use whatever you for templating.

Let's say you want to use Underscore.JS.

```javascript
app.template = function(template, data) {
  // Use Underscore's templating
  var compiled = _.template(template);
  return compiled(data);
};
```

The template function takes two parameters always. The HTML as a string and data as an object.

By adding the template function Andraia will automatically render the template substituing your template values. Using the example above

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