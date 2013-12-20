andraia-js-mobile-framework
===========================

An ultra-lightweight javascript framework for building small mobile apps the way you like

Models
------

Models are easy.

```
var andraia = new Andraia('game-cube');
var user = andraia..model('User', function() {
  this.firstName = 'Enzo';
  this.lastName = 'Matrix';
  this.fullName = function() {
    return this.firstName + ' ' + this.lastName;
  };
});
```