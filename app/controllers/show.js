//var api=require('../library/kinobazza.js');
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
            res.render('show/find',{result:(body?body:[]), query:q});
        });
    }
    else
    {
        res.render('show/find',{result:[], query:''});
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
            res.render('show/find',{result:body.slice(0,20)});
        }
    );

};
exports.view = function (req, res)
{
    var id=req.params.id;
    var localResult = {};
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
                                localResult.show = show;
                                callback();
                            }
                        );
                    }
                    else
                    {
                        localResult.show = show;
                        callback();
                    }
                });
            },
            function(callback){
                localResult.isGuest = res.locals.isGuest;
                UserShow.findOne({user_id:req.user? req.user._id:0,show_id:id},function(err, record){
                    if (err) return callback(err);
                    localResult.watchedByUser = record ? true: false;
                    callback();
                });
            },
        ],
        function(err){
            res.render('show/view',localResult);
        }
    );
};

exports.seasons = function (req, res)
{
    var id=req.params.id;
    var local = {};
    async.series(
        [
            function (callback)
            {
                Season.find({show_id:id},function(err, season){
                    local.season = season;
                    callback();
                });
            },
            function (callback)
            {
                if (local.season.length<1)
                {
                    api.sendRequest(
                        {
                            url: '/show/seasons.json/',
                            queryParams: {id:id}
                        },
                        function (err, response, body)
                        {
                            local.season = body;
                            for (var i=0; i<body.length;i++)
                            {
                                var s = new Season();
                                s.setAttributes(body[i]);
                                s.show_id = id;
                                s.save();
                            }
                            callback();
                        }
                    );
                }
                else
                {
                    callback();
                }
            }
        ],
        function(err){
            res.render('show/_seasons',{seasons:local.season,item_id:id},function(err, html){
                var returnObject = {
                    seasons:html,
                    err:err
                };
                returnObject.success = true;
                var returnObjectString = JSON.stringify(returnObject);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(returnObjectString);
            });
        }
    );
};

exports.episodes = function (req, res)
{
    var id=req.params.id;
    var season=req.params.season;
    var userId = req.user ? req.user._id : -1;
    var local = {};
    async.parallel(
        [
            function (callback)
            {
                Episode.find({show_id:id,season:season},function(err, episode){
                    local.episode = episode;
                    if (local.episode.length<1)
                    {
                        api.sendRequest(
                            {
                                url: '/show/season.json/',
                                queryParams: {id:id,season:season}
                            },
                            function (err, response, body)
                            {
                                local.episode = body;
                                for (var i=0; i<body.length;i++)
                                {
                                    var s = new Episode();
                                    s.setAttributes(body[i]);
                                    s.show_id = id;
                                    s.save();
                                }
                                callback();
                            }
                        );
                    }
                    else
                    {
                        callback();
                    }
                });
            },
            function (callback)
            {
                UserEpisode.find({user_id:userId,show_id:id,season:season},function(err, data){
                    local.ids = {};
                    for (var i=0; i<data.length;i++)
                    {
                        local.ids[data[i].episode] = true;
                    }
                    callback();
                });
            }
        ],
        function(err){
            res.render('show/_episodes',{episodes:local.episode,item_id:id, season:season, ids:local.ids,isGuest :res.locals.isGuest},function(err, html){
                var returnObject = {
                    season:html,
                    err:err
                };
                returnObject.success = true;
                var returnObjectString = JSON.stringify(returnObject);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(returnObjectString);
            });
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
        var returnObjectString = JSON.stringify(returnObject);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(returnObjectString);
    });
};

exports.list = function (req, res)
{
    if (req.isUnauthenticated() || typeof req.user == 'undefined')
    {
        res.redirect('/');
    }

    var localResult = {ids:[],shows:[]};
    async.series(
        [
            function(callback)
            {
                UserShow.find({user_id:req.user._id},function(err,ushows){
                    if (err) return callback(err)
                    for(var i=0;i<ushows.length;i++)
                    {
                        localResult.ids.push(ushows[i].show_id);
                    }
                    callback();
                });
            },
            function(callback)
            {
                if (localResult.ids.length>0)
                {
                    Show.find({ tvdb_id: { $in: localResult.ids } },function(err, shows){
                        if (err) return callback(err);
                        localResult.shows = shows;
                        callback();
                    });
                }
                else
                {
                    callback();
                }
            },
        ],
        function(err){
            res.render('show/my_list',localResult);
        }
    );
};

exports.add = function (req, res)
{
    var data = req.params;
    Show.findOne({tvdb_id:data.id},function(err, show){
        var userShow = new UserShow();
        userShow.user_id = req.user._id;
        if (err)
        {
        }
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
        var returnObject = {};
        returnObject.success = true;
        var returnObjectString = JSON.stringify(returnObject);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(returnObjectString);
    });

};
exports.remove = function (req, res)
{
    var data = req.params;
    UserShow.remove({show_id:data.id},function(err){
        if (err) {}
        var returnObject = {};
        returnObject.success = true;
        var returnObjectString = JSON.stringify(returnObject);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(returnObjectString);
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
                now.setDate(3);
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
                                '<a href="/show/view/'+ c.show.tvdb_id+'/">' + c.show.title +'</a> notification.' +
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