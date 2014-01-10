var app = new Andraia('game-cube', {
  'pageTransitionSpeed': 0.6,
  'templateEngine': 'Underscore.JS',
  'defaultPage': 'loginView'
});

app.registerModel('User', function() {

  // Initiate the model with some properties
  var userAccess = {
    "firstName": "Enzo",
    "lastName": "Matrix"
  };

  userAccess.fullName = function() {
    return this.firstName + ' ' + this.lastName;
  };

  // It is important you return an object with the properties and methods which are publically accessible.
  return userAccess;
});

// To use the model, say in a controller (or anywhere)
var user = app.loadModel('User');
console.log("User's name:", user.fullName() );

// app.injectTemplating(function(template, data) {
//   // Use Underscore's templating
//   var compiled = _.template(template);
//   return compiled(data);
// });

app.registerTemplateHeader('#headerHtml');
app.registerTemplateFooter('</div>');

app.registerHelper('add', function(a, b){
  return a + b;
});

app.error('Something went wrong', 'Could not perform certain task [errorCode 1142]');

var loginCtrl = function(helper) {
  $('[name=email]').blur  (function(e){
    console.log($('[name=email]').val());
  });

  var sum = helper.add(1,2);
  console.log(sum);
};
var loginData = {
  "format": "Game Sprite"
};
app.registerView('loginView', loginCtrl, loginData);

app.registerView('andraiaView', function(){
  console.log('andraiaView');
});

app.registerView('thirdView', function(){
  console.log('thirdView');
}, {
  'data': 'test'
});

app.loadView('loginView');