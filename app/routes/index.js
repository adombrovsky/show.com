var main = require(__dirname + '/../controllers/main');
var show = require(__dirname + '/../controllers/show');
var user = require(__dirname + '/../controllers/user');
var passport = require('passport');
var _ = require('underscore');

function checkUserAuthentication (req, res, next) {
    res.locals.isGuest = req.isUnauthenticated();
    var onlyLoggedUsers = ['/user/','/user/save/', '/show/list/'];
    if (req.isUnauthenticated() && _.include(onlyLoggedUsers, req.path) )
    {
        res.redirect('/error/');
    }
    else
    {
        next();
    }
}

module.exports = function (app)
{
    app.get('*', checkUserAuthentication);
    app.get('/', main.index);
    app.post('/login',main.loginLocal);
    app.get('/logout',main.logout);

    app.get('/login/google',passport.authenticate('google',{scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
    app.get('/login/google/callback',passport.authenticate('google',{ failureRedirect: '/' }),main.loginGoogle);


    app.get('/show/list', show.list);
    app.get('/show/find', show.find);
    app.get('/show/trend', show.trend);
    app.get('/show/view/:id', show.view);
    app.get('/show/:id/seasons', show.seasons);
    app.get('/show/:id/season/:season', show.episodes);
    app.get('/show/:id/season/:season/episode/:episode/add', show.addEpisode);
    app.get('/show/add/:id', show.add);
    app.get('/show/remove/:id', show.remove);

    app.get('/user/',user.index);
    app.post('/user/save',user.updateProfile);
};