var express = require('express'),
stormpath = require('express-stormpath'),
pwd = process.cwd(),
stylus = require('stylus'),
nib = require('nib');
var keyfile = pwd + '/.stormpath/apiKey.properties';
var app = express();
var currUser;

// var mongoose = require('mongoose'); mongoose.connect('mongodb://heroku_app36070442:9441gn6pji392s59nd7t3n9suq@dbh11.mongolab.com:27117/heroku_app36070442');
// var db = mongoose.connection;

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', './views');
app.set('view engine', 'jade');
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: keyfile,
  application: 'https://api.stormpath.com/v1/applications/68wtNUaBNZUM3HicQ3PEQr',
  secretKey: 'some_long_random_string',
  expandCustomData: true,
  enableForgotPassword: true,
  enableFacebook: true,
  social: {
    facebook: {
      appId: '729604067154235',
      appSecret: 'a3fc4cae48579ba686e12df1a56800f9',
      }
    }
});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(stormpathMiddleware);

app.get('/', function(req, res) {
    currUser = res.locals.user;
    res.render('home', {
    title: 'Welcome'
    });
    module.exports.currUser = res.locals.user;
});

app.get('/admins', stormpath.groupsRequired(['admins']), function(req, res) {
  res.send('If you can see this page, you are an admin!');
});

app.use('/profile', stormpath.loginRequired, require('./profile')());
//console.log("currUser: " + locals.user);
app.use('/newsr', stormpath.loginRequired, require('./newsr')(stormpath.user));
app.use('/friends', stormpath.loginRequired, require('./friends')());

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
