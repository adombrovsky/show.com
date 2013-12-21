var api=require('../library/trakt.js');
var User = require('../models/User');
var Show = require('../models/Show');
var Season = require('../models/Season');
var Episode = require('../models/Episode');
var UserShow = require('../models/UserShow');
var UserEpisode = require('../models/UserEpisode');
var UserNotification = require('../models/UserNotification');
var async = require('async');
var _ = require('underscore');
var dateformat = require('dateformat');

exports.find = function (req, res)
{
    var q=req.query.query;
    if (q)
    {
        var searchOptions={
            url: '/search/shows.json/',
            queryParams: {query:encodeURIComponent(q)}
        };
        api.sendRequest(searchOptions,function (err, response, body){
            res.json(body);
        });
    }
    else
    {
        res.json({});
    }
};

exports.trend = function (req, res)
{
    api.sendRequest(
        {
            url: '/shows/trending.json/',
            queryParams: {}
        },
        function (err, response, body)
        {
            res.json(body);
        }
    );

};
exports.view = function (req, res)
{
    var id=req.params.id;
    async.parallel(
        [
            function(callback){
                Show.findOne({tvdb_id:id},function(err, show){
                    if (err) return callback(err);
                    if (!show)
                    {
                        api.sendRequest(
                            {
                                url: '/show/summary.json/',
                                queryParams: {id:id}
                            },
                            function (err, response, body)
                            {
                                var show = new Show();
                                show.setAttributes(body);
                                show.validate(function(){show.save();});
                                callback(err, show);
                            }
                        );
                    }
                    else
                    {
                        callback(err, show);
                    }
                });
            },
            function(callback){
                UserShow.findOne({user_id:req.user? req.user._id:0,show_id:id},function(err, record){
                    if (err) return callback(err);
                    callback(err, {isGuest:res.locals.isGuest, watchedByUser:record ? true: false,});
                });
            },
        ],
        function(err, result){
            res.json({show:result[0],isGuest:result[1].isGuest,watchedByUser:result[1].watchedByUser});
        }
    );
};

exports.seasons = function (req, res)
{
    var id=req.params.id;
    Season.find({show_id:id},function(err, season){
        console.log(season);
        var result = {};
        if (err) {
            result.message = 'error';
        }
        else if (!season)
        {
            api.sendRequest(
                {
                    url: '/show/seasons.json/',
                    queryParams: {id:id}
                },
                function (err, response, body)
                {
                    for (var i=0; i<body.length;i++)
                    {
                        var s = new Season();
                        s.setAttributes(body[i]);
                        s.show_id = id;
                        s.save();
                    }
                    result.seasons = body;
                }
            );
        }
        else
        {
            result.seasons = season;
        }
        res.json(result.seasons);
    });
};

exports.episodes = function (req, res)
{
    var id=req.params.id;
    var season=req.params.season;
    var userId = req.user ? req.user._id : -1;
    async.parallel(
        [
            function (callback)
            {
                Episode.find({show_id:id,season:season},function(err, episode){
                    if (!episode || episode.length<1)
                    {
                        api.sendRequest(
                            {
                                url: '/show/season.json/',
                                queryParams: {id:id,season:season}
                            },
                            function (err, response, body)
                            {
                                for (var i=0; i<body.length;i++)
                                {
                                    var s = new Episode();
                                    s.setAttributes(body[i]);
                                    s.show_id = id;
                                    s.save();
                                }
                                callback(err,body);
                            }
                        );
                    }
                    else
                    {
                        callback(err, episode);
                    }
                });
            },
            function (callback)
            {
                UserEpisode.find({user_id:userId,show_id:id,season:season},function(err, data){
                    var ids = {};
                    if (err) return callback(err);
                    for (var i=0; i<data.length;i++)
                    {
                        ids[data[i].episode] = true;
                    }
                    callback(err, ids);
                });
            }
        ],
        function(err, result){
            res.json(
                {
                    episodes:result[0],
                    item_id:id,
                    season:season,
                    ids:result[1],
                    isGuest :res.locals.isGuest
                }
            );
        }
    );
};

exports.addEpisode = function (req, res)
{
    var data = req.params;
    data.user_id = req.user._id;
    var userEpisode = new UserEpisode();
    userEpisode.setAttributes(data);
    userEpisode.show_id = data.id;
    userEpisode.save(function(err){
        var returnObject = {};
        returnObject.success = true;
        returnObject.episodeAdd = true;
        res.json(returnObject)
    });
};

exports.list = function (req, res)
{
    if (req.isUnauthenticated() || typeof req.user == 'undefined')
    {
        res.redirect('/');
    }

    async.waterfall(
        [
            function(callback)
            {
                UserShow.find({user_id:req.user._id},function(err,ushows){
                    var ids = [];
                    if (err) return callback(err);
                    for(var i=0;i<ushows.length;i++)
                    {
                        ids.push(ushows[i].show_id);
                    }
                    callback(err, ids);
                });
            },
            function(ids, callback)
            {
                if (ids.length>0)
                {
                    Show.find({ tvdb_id: { $in: ids } },function(err, shows){
                        if (err) return callback(err);
                        callback(err, shows, ids);
                    });
                }
                else
                {
                    callback('error',[],ids);
                }
            },
        ],
        function(err,result,ids){
            res.json({shows:result, ids:ids});
        }
    );
};

exports.add = function (req, res)
{
    var data = req.params;
    async.waterfall(
        [
            function(callback)
            {
                UserShow.findOne({user_id:req.user._id, show_id:data.id},function(err,show){
                    if (err) return callback(err);
                    callback(err, show);
                });
            },
            function(show, callback)
            {
                if (!show)
                {
                    Show.findOne({tvdb_id:data.id},function(err, show){
                        var userShow = new UserShow();
                        userShow.user_id = req.user._id;
                        if (err){ return callback(err);}
                        if (!show)
                        {
                            api.sendRequest(
                                {
                                    url: '/show/summary.json/',
                                    queryParams: {id:data.id}
                                },
                                function (err, response, body)
                                {
                                    var show = new Show();
                                    show.setAttributes(body);
                                    show.validate(function(){
                                        show.save();
                                        userShow.show_id = data.id;
                                        userShow.save();
                                    });
                                }
                            );
                        }
                        else
                        {
                            userShow.show_id = data.id;
                            userShow.save();
                        }
                    });
                    callback(null,'show is added successfully');
                }
                else
                {
                    callback('error','show is already added');
                }
            },
        ],
        function(err,result){
            var returnObject = {};
            returnObject.success = true;
            returnObject.message = result;
            res.json(returnObject);
        }
    );

};
exports.remove = function (req, res)
{
    var data = req.params;
    UserShow.remove({show_id:data.id},function(err){
        if (err) {}
        var returnObject = {};
        returnObject.success = true;
        res.json(returnObject);
    });
};

/*cron actions*/

/**
 * 1) Get shows_id selected by all users
 * 2) @deprecated Get shows by id(doesn't need)
 * 3) Set current date
 * 4) Get all premiers for this day
 * 5) Check user selected show and premier show
 * 6) Add notification to db and connect it to users
 * @param req
 * @param res
 */
exports.checkNewEpisodes = function(req, res)
{
    async.series(
        {
            showsUsers:function (callback)
            {
                console.log('get users show');
                UserShow.find({},function(err, records){
                    if (err)
                    {
                        callback(err,{});
                    }
                    else
                    {
                        var showsUsers = {};
                        for (var i=0;i<records.length;i++)
                        {
                            var c = records[i];
                            showsUsers[c.show_id] = showsUsers[c.show_id] || [];
                            showsUsers[c.show_id].push(c.user_id);
                        }
                        callback(null, showsUsers);
                    }
                });
            },
            premiers:function (callback)
            {
                console.log('get premiers');
                var now = new Date();
                var currentDate = dateformat(now,'yyyymmdd');
                api.sendRequest(
                    {
                        url: '/calendar/shows.json/',
                        queryParams: {date:currentDate,days:1}
                    },
                    function (err, response, body)
                    {
                        if (err)
                        {
                            callback(err, {});
                        }
                        else
                        {
                            callback(null,body[0].episodes);
                        }
                    }
                );
            }
        },
        function(err, result){
            if (err)
            {
                console.log('error in result function: ',err);
            }
            var now = new Date();
            var currentDate = dateformat(now,'fullDate');
            console.log('run result function');
            for (var i = 0; i<result.premiers.length;i++)
            {
                var c = result.premiers[i];
                if (typeof result.showsUsers[c.show.tvdb_id] !== 'undefined')
                {
                    var usersList = result.showsUsers[c.show.tvdb_id];
                    for (var j=0;j<usersList.length;j++)
                    {
                        var a = new UserNotification();
                        var data = {
                            title: 'New episode is coming!',
                            text: 'Hi! You are subscribed for a new episodes of ' +
                                '<a href="#/show/view/'+ c.show.tvdb_id+'/">' + c.show.title +'</a> notification.' +
                                currentDate + ' at '+ c.show.air_time+ ' episode <b>#'+ c.episode.number+'</b> shows on a tv!',
                            date: new Date().getTime(),
                            user_id:usersList[j],
                            type_id:1,
                            unread:1,
                            episode_info:c
                        };

                        new User().sendNotifications(data, res.app.mailer);
                        a.setAttributes(data);
                        a.save(function(err){
                            if (err)
                            {
                                console.log('error for user:', data.user_id);
                                console.log('error:',err);
                            }
                            else
                            {
                                console.log('added message for user:', data.user_id);
                            }
                        });
                    }
                }
            }
        }
    );
};