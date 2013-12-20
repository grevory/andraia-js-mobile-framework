andraia-js-mobile-framework
===========================

An ultra-lightweight javascript framework for building small mobile apps the way you like

Models
------

Models are easy.

```javascript
var andraia = new Andraia('game-cube');
var user = andraia.model('User', function() {
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
var andraia = new Andraia('game-cube');
var user = andraia.model('User', function() {
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