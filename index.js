var express = require('express'),
stormpath = require('express-stormpath'),
pwd = process.cwd(),
stylus = require('stylus'),
nib = require('nib');
var keyfile = pwd + '/.stormpath/apiKey.properties';
var app = express();
var currUser;

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', './views');
app.set('view engine', 'jade');
app.use(stylus.middleware(
  { src: __dirname + '/public',
    compile: compile
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
  },
  postRegistrationHandler: function(account, req, res, next) {
    account.getCustomData(function(err, data) {
      if (err) return next(err);
      data.rating = 0; //0 rating
      data.friends = []; //empty array
      data.save();
      next();
    });
  },
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
app.use('/newsr', stormpath.loginRequired, require('./newsr')(stormpath.user));
app.use('/friends', stormpath.loginRequired, require('./friends')());
app.use('/wishlist', stormpath.loginRequired, require('./wishlist')());
app.use('/notifs', stormpath.loginRequired, require('./notifs')());

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
