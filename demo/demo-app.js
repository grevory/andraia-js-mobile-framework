var app = new Andraia('game-cube');

app.model('User', function() {
  this.firstName = 'Enzo';
  this.lastName = 'Matrix';
  this.fullName = function() {
    return this.firstName + ' ' + this.lastName;
  };
});

var user = app.model('User');
console.log(user.fullName());

app.template = function(template, data) {
  // Use Underscore's templating
  var compiled = _.template(template);
  return compiled(data);
};

app.injectHelper('add', function(a, b){
  return a + b;
});

app.error('Something went wrong', 'Could not perform certain task [errorCode 1142]');
var loginCtrl = function(helper) {
  $('[name=email]').focus(function(e){
    console.log($('[name=email]').val());
  });

  var sum = helper.add(1,2);
  console.log(sum);
};
var loginData = {
  "format": "Game Sprite"
};
app.view('loginView', loginCtrl, loginData);