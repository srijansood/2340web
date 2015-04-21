var express = require('express');
var app = express();
var cool = require('cool-ascii-faces');
var pg = require('pg');
var express = require('express');
var stormpath = require('express-stormpath');
var app = express();
//var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
//var keyfile = homedir + '/Dropbox/Studies/CS2340/web/.stormpath/apiKey.properties';
var pwd = process.cwd();
var keyfile = pwd + '/.stormpath/apiKey.properties';

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: keyfile,
  application: 'https://api.stormpath.com/v1/applications/68wtNUaBNZUM3HicQ3PEQr',
  secretKey: 'some_long_random_string',
  expandCustomData: true,
  enableForgotPassword: true
});


app.set('views', './views');
app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(stormpathMiddleware);

app.get('/', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
        result += cool();
    }
    //uses the env variable TIMES from .env to append the result TIMES times.

    response.render('home', {
    title: 'Welcome'
    });

    response.send(result);
});

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

app.use('/profile',stormpath.loginRequired,require('./profile')());

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
