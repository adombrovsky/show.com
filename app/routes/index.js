var main = require(__dirname + '/../controllers/main');
var show = require(__dirname + '/../controllers/show');
var user = require(__dirname + '/../controllers/user');
var notification = require(__dirname + '/../controllers/notification');
var passport = require('passport');
var _ = require('underscore');

function checkUserAuthentication (req, res, next) {
    res.locals.isGuest = req.isUnauthenticated();

    var onlyLoggedUsers = ['/user/','/user/save/', '/show/list/', '/user/settings/', '/notification/', '/notification/count/'];
    if (res.locals.isGuest && _.include(onlyLoggedUsers, req.path))
    {
        res.redirect('/');
    }
    else
    {
        next();
    }
}

module.exports = function (app)
{
    app.all('*', checkUserAuthentication);
    app.get('/', main.index);
    app.get('/about', main.about);
    app.post('/contact', main.contactForm);
    app.post('/login',main.loginLocal);
    app.get('/logout',main.logout);
//    app.get('/partials/:name',main.partials);
    app.get('/views/:folder/:name',main.partials);

    app.get('/login/google',passport.authenticate('google',{scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
    app.get('/login/google/callback',passport.authenticate('google',{ failureRedirect: '/' }),main.loginGoogle);


//    app.get('/show/test', show.updateTrendShows);
    app.get('/show/list', show.list);
    app.get('/show/list/:page', show.list);
    app.get('/show/popular', show.popular);
    app.get('/show/find', show.find);
    app.get('/show/trend', show.trend);
    app.get('/show/trend/:page', show.trend);
    app.get('/show/view/:id', show.view);
    app.get('/show/:id/seasons', show.seasons);
    app.get('/show/:id/season/:season', show.episodes);
    app.get('/show/:id/season/:season/add', show.addSeason);
    app.get('/show/:id/season/:season/remove', show.removeSeason);
    app.get('/show/:id/season/:season/episode/:episode/add', show.addEpisode);
    app.get('/show/add/:id', show.add);
    app.get('/show/remove/:id', show.remove);

    app.get('/user/',user.index);
    app.post('/user/save',user.updateProfile);
    app.get('/user/settings',user.settings);
    app.post('/user/settings/save',user.updateSettings);

    app.get('/notification/',notification.index);
    app.get('/notification/:page',notification.index);
    app.post('/notification/count',notification.getUserNotifications);
    app.post('/notification/markAsRead',notification.setAsRead);
};