var app = new Andraia('game-cube', {
  'pageTransitionSpeed': 0.6,
  'templateEngine': 'Underscore.JS',
  'defaultPage': 'loginView'
});

app.registerHelper('calculateAge', function(name){
  var ages = {
    'Enzo Matrix': 14,
    'Bob': 24
  };

  return ages[name];
});

app.registerModel('User', function(helper) {

  // To illustrate which elements within this function are private and which are public
  // they have been named accordingly. These names are not required.
  var _public = {},
    _private = {};
  
  // Initiate the model with some properties
  _private.firstName = "Enzo";
  _private.lastName = "Matrix";

  _public.fullName = function() {
    return _private.firstName + ' ' + _private.lastName;
  };

  _public.age = function() {
    return helper.calculateAge(_public.fullName());
  };

  // It is important you return an object with the properties and methods which are publically accessible.
  return _public;
});

// To use the model, say in a controller (or anywhere)
var user = app.loadModel('User');
console.log("User's name:", user.fullName() );
console.log("User's age:", user.age() + ' seconds old');

app.registerTemplating(function(template, data){
  var dataIndex, regexPattern;

  for (dataIndex in data) {
    regexPattern = new RegExp('{{\\s*' + dataIndex + '\\s*}}', 'gi');
    template = template.replace(regexPattern, data[dataIndex]);
  }

  return template;
});

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