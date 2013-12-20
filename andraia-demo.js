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
}

app.error('Something went wrong', 'Could not perform certain task [errorCode 1142]');
app.view('loginView', function(){
  console.log('controller loaded'); 
  $('[name=email]').click(function(e){
    e.preventDefault();
    console.log($('[name=email]').val());
  });
}, {
  "format": "Game Sprite"
});
