var app = require(__dirname + '/app');
var cfg = require(__dirname + '/app/config');
var config = cfg.loadConfig(cfg.appConfig)

app.listen(config.http.port, function () {
    console.log('You are listening a', config.http.port);
    console.log('This is a '+process.env.NODE_ENV+' environment');
});