var express = require('express');
var cfg = require('./config');
var config = cfg.loadConfig(cfg.appConfig);
var jade = require('jade');
var app = express();
var mongoose = require('mongoose');
var mailer = require('express-mailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('./models/User');

var cronJobs = require('./library/cron');

//use mongoDB for storing sessions
var mongoStore = require('connect-mongo')(express);

var mongoUri = 'mongodb://' + config.db.user+':'+ config.db.pass+'@'+config.db.host+':'+config.db.port+ '/' + config.db.name;
mongoose.connect(mongoUri);

//setting up mailer
mailer.extend(app,config.mailer);

/*settings for passport authentication*/
passport.use(new GoogleStrategy(
    {
        clientID: config.googleApi.clientID,
        clientSecret: config.googleApi.clientSecret,
        callbackURL: config.googleApi.callbackURL
    },
    function(accessToken, refreshToken, profile, done)
    {
        User.findOne(
            {
                email: profile.emails[0].value
            },
            function(err, user){
                if (err) { return done(err); }
                if (!user) {
                    user = new User();
                    user.name       = profile.name.familyName + ' ' + profile.name.givenName;
                    user.email      = profile.emails[0].value;
                    user.googleId   = profile.id;
                    user.salt       = user.makeSalt();
                    user.password   = user.encryptPassword('test');
//                    user.validate(function(){
//                        user.save();
//
//                    });
                }
//                else
//                {
//                    user.googleId = profile.id;
//                    user.save();
//                    return done(null, user);
//                }
                user.googleId = profile.id;
                user.save(function(err){
                    if (err)
                    {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    else
                    {
                        return done(null, user);
                    }
                });
            }
        );
    }
));

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done)
    {
        User.findOne(
            {
                email: username
            },
            function(err, user){
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Incorrect email', field:'email'});
                }
                if (!user.authenticate(password))
                {
                    return done(null, false, { message: 'Incorrect password.', field:'password' });
                }
                return done(null, user);
            }
        );
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

/*end settings for passport authentication*/

app.use(express.static(__dirname + '/../public'));
//add this 2 lines for sessions support
app.use(express.cookieParser());
app.use(express.session({
    cookie: {
        maxAge: new Date(Date.now() + 3600000)
    },
    secret: 'thisismysecret',
    store: new mongoStore({
        url: mongoUri
    })
}));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.engine('jade', jade.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
require(__dirname + '/routes/')(app);

// 404 error handler
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

//run my cronjobs
cronJobs.runJobs(app.request, app.response);

module.exports = app;
