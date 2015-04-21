var express = require('express');
var cool = require('cool-ascii-faces');
var pg = require('pg');
var stormpath = require('express-stormpath');
var pwd = process.cwd();
var keyfile = pwd + '/.stormpath/apiKey.properties';
var fbSecret = pwd + '/.facebook.properties';
var app = express();

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

app.set('views', './views');
app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(stormpathMiddleware);

app.get('/', function(request, response) {
    response.render('home', {
    title: 'Welcome'
    });
});

//Databse using PostgreSQL
app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
  });
})

app.get('/admins', stormpath.groupsRequired(['admins']), function(req, res) {
  res.send('If you can see this page, you must be an admin!');
});

app.use('/profile',stormpath.loginRequired,require('./profile')());

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
