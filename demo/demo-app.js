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
console.log('The User model has been properly loaded. Check out some values:');
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

// Establish models from AJAX calls the cheap way:
$.getJSON('http://www.omdbapi.com/?i=&t=reboot', function(data) {
  app.registerModel('series', function() {
    return {
      'title': data.Title,
      'years': data.Year,
      'posterUrl': data.Poster,
      'plot': data.Plot,
      'genre': data.Genre
    };
  });
});

app.error('Something went wrong', 'Could not perform certain task [errorCode 1142]');

var loginCtrl = function(helper) {
  app.bind('[name=email]', 'blur', function(){
    console.log($(this).val());
  });

  app.bind('[name=password]', 'focus', function(){
    console.log('Don\'t let anyone see!');
  });

  var sum = helper.add(1,2);
  console.log(sum);
};

var loginData = {
  "format": "Game Sprite"
};
app.registerView('loginView', loginCtrl, loginData);

app.registerView('andraiaView', function(){
  console.log('andraiaView controller has been properly executed.');
});

app.registerView('seriesView', null, function() {
  return app.loadModel('series');
});

app.loadView('loginView');