var User = require('../models/User');
var Show = require('../models/Show');
var passport = require('passport');
var cfg = require('../config');
var config = cfg.loadConfig(cfg.appConfig);

exports.index = function (req, res)
{
    res.render('main/index');
};

exports.about = function (req, res)
{
    res.render('main/about');
};

exports.contactForm = function (req, res)
{
    var returnObject = {};
    var formData = req.body;
    res.app.mailer.send('email/contact_form', {
        from:'no-reply@show.com',
        to: config.mailer.from, // REQUIRED. This can be a comma delimited string just like a normal email to field.
        subject: formData.message_type, // REQUIRED.
        message: formData.text, // REQUIRED.
        username: formData.username // REQUIRED.
    }, function (err) {
        returnObject.success = true;
        returnObject.message = 'Message successfully sent!';
        if (err) {
            returnObject.success = false;
            returnObject.message = 'Oops. Error! You can\'t send this message! Somethis goes wrong!';
        }
        res.json(returnObject);
    });
};

exports.partials = function(req, res)
{
    res.render(req.params.folder+'/'+req.params.name);
};

exports.loginGoogle = function (req, res)
{
    var getParams = req.query;
    if (getParams.code)
    {
        res.redirect('/');
    }
    else
    {
        req.write(404);
        req.end();
    }
};

exports.loginLocal = function (req, res, next)
{
    var returnObject = {};
    if (req.isUnauthenticated())
    {
        passport.authenticate('local', function(err, user, info){
            returnObject.info = info;
            if (err) {
                return next(err);
            }
            if (!user) {
                returnObject.success = false;
            }
            else
            {
                req.logIn(user, function(err){
                    if (err) {
                        return next(err);
                    }
                    returnObject.success = true;
                    returnObject.action = 'reload';
                });
            }
            res.json(returnObject);
        })(req, res, next);
    }
};

exports.logout = function (req, res)
{
    req.logout();
    res.redirect('/');
};