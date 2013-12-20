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

You can design it any way you like.

```javascript
var app = new Andraia('game-cube');
var user = app.model('User', function() {
  var firstName = 'Enzo';
  var lastName = 'Matrix';
  var getFullName = function() {
    return this.firstName + ' ' + this.lastName;
  };

  return {
    fullName: getFullName
  }
});
console.log("User's name", user.fullName);
```