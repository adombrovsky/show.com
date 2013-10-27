var User = require('../models/User');
var Show = require('../models/Show');
var passport = require('passport');

exports.index = function (req, res)
{
    res.render('main/index');
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
            var returnObjectString = JSON.stringify(returnObject);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(returnObjectString);
        })(req, res, next);
    }
};

exports.logout = function (req, res)
{
    req.logout();
    res.redirect('/');
};