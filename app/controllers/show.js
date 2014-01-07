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
            var isGuest = res.locals.isGuest;
            var ids = {};
            if (req.user)
            {
                UserShow.find({user_id:req.user._id},function(err,ushows){
                    if (err) return false;
                    for(var i=0;i<ushows.length;i++)
                    {
                        ids[ushows[i].show_id] = true;
                    }
                    res.json({body:body, ids:ids, isGuest:isGuest});
                });
            }
            else
            {
                res.json({body:body,ids:ids, isGuest: isGuest});
            }
        });
    }
    else
    {
        res.json({});
    }
};

exports.trend = function (req, res)
{
    var page = req.params.page - 1;
    var itemPerPage = 52;
    var skip = page * itemPerPage;
    async.parallel(
        [
            function(callback)
            {
                var ids = {};
                if (!res.locals.isGuest)
                {
                    UserShow.find({user_id:req.user._id},function(err,ushows){
                        if (err) callback(err);
                        for(var i=0;i<ushows.length;i++)
                        {
                            ids[ushows[i].show_id] = true;
                        }
                        callback(err, {ids:ids});
                    });
                }
                else
                {
                    callback(null, {ids:ids});
                }
            },
            function(callback)
            {
                Show.find({trend:1},null,{limit:itemPerPage, skip:skip},function(err, records){
                    if (err) callback(err);
                    callback(err, {shows:records});
                });
            },
            function(callback)
            {
                Show.count({trend:1},function(err, count){
                    if (err) callback(err);
                    callback(err, {count:count});
                });
            }
        ],
        function(err,result)
        {
            var pagesCount = Math.ceil(result[2].count/itemPerPage);
            res.json({body:result[1].shows,ids:result[0].ids,pagesCount:pagesCount, isGuest:res.locals.isGuest});
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
                                queryParams: {id:id, extended:'extended'}
                            },
                            function (err, response, body)
                            {
                                var show = new Show();
                                show.setAttributes(body);
                                show.validate(function(){show.save();});
                                callback(err, {show:show, seasonsCount: body.seasons[0].season});
                            }
                        );
                    }
                    else
                    {
                        Season.find({show_id:show.tvdb_id},function(err, seasons){
                            if (err) callback(err);
                            callback(err, {show:show, seasonsCount: seasons.length});
                        });
                    }
                });
            },
            function(callback){
                UserShow.findOne({user_id:req.user? req.user._id:0,show_id:id},function(err, record){
                    if (err) return callback(err);
                    callback(err, {watchedByUser:record ? true: false});
                });
            },
        ],
        function(err, result){
            res.json({show:result[0].show,seasonsCount:result[0].seasonsCount,isGuest:res.locals.isGuest,watchedByUser:result[1].watchedByUser});
        }
    );
};

exports.seasons = function (req, res)
{
    var id=req.params.id;
    Season.find({show_id:id},function(err, seasons){
        if (err) {

        }
        else if (seasons.length <1)
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
                        if (parseInt(body[i].season) === 0) {
                            continue;
                        }
                        var s = new Season();
                        s.setAttributes(body[i]);
                        s.show_id = id;
                        s.save();
                    }
                    res.json(body);
                }
            );
        }
        else
        {
            res.json(seasons);
        }
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
                    fullSeasonAdded: result[0].length === Object.keys(result[1]).length,
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
        returnObject.message = 'Episode was added successfully!';
        if (err)
        {
            returnObject.success = false;
            returnObject.episodeAdd = false;
            returnObject.message = 'Oops. Error! Episode was not added successfully!';
        }
        res.json(returnObject)
    });
};

exports.addSeason = function (req, res)
{
    var data = req.params;

    async.waterfall(
        [
            function(callback)
            {
                UserEpisode.remove({show_id:data.id,season:data.season, user_id:req.user._id},function(err){
                    callback(err);
                });
            },
            function(callback)
            {
                Episode.find({show_id:data.id,season:data.season},function(err, episodes){
                    var ids = {};
                    for(var i=0;i<episodes.length;i++)
                    {
                        var userEpisode = new UserEpisode();
                        userEpisode.setAttributes(episodes[i]);
                        userEpisode.user_id = req.user._id;
                        ids[episodes[i].episode] = true;
                        userEpisode.save();
                    }
                    callback(err, ids);
                });
            },
        ],
        function(err,ids){
            var returnObject = {};
            returnObject.success = true;
            returnObject.ids = ids;
            returnObject.message = 'Season was added successfully!';
            if (err)
            {
                returnObject.success = false;
                returnObject.message = 'Oops. Error! Season was not added successfully!';
            }
            res.json(returnObject);
        }
    );
};

exports.removeSeason = function (req, res)
{
    var data = req.params;
    UserEpisode.remove({show_id:data.id,season:data.season, user_id:req.user._id},function(err){
        var returnObject = {};
        returnObject.success = true;
        returnObject.message = 'Season was removed successfully!';
        if (err)
        {
            returnObject.success = false;
            returnObject.message = 'Oops. Error! Season was not removed successfully!';
        }
        res.json(returnObject);
    });
};

exports.list = function (req, res)
{
    if (req.isUnauthenticated() || typeof req.user == 'undefined')
    {
        res.redirect('/');
    }
    var page = req.params.page - 1;
    var itemPerPage = 20;
    var skip = page * itemPerPage;
    async.waterfall(
        [
            function(callback)
            {
                UserShow.find({user_id:req.user._id},function(err,ushows){
                    var ids = {};
                    if (err) callback(err);
                    for(var i=0;i<ushows.length;i++)
                    {
                        ids[ushows[i].show_id] = true;
                    }
                    callback(err, ids);
                });
            },
            function(ids, callback)
            {
                if (Object.keys(ids).length>0)
                {
                    Show.count({ tvdb_id: { $in: Object.keys(ids) } },function(err, count){
                        if (err) callback(err);
                        Show.find({ tvdb_id: { $in: Object.keys(ids) } },null,{limit:itemPerPage, skip:skip},function(err, shows){
                            callback(err, ids, count, shows);
                        });
                    });
                }
                else
                {
                    callback('error',[],ids);
                }
            }
        ],
        function(err, ids, count, shows){
            var pagesCount = Math.ceil(count/itemPerPage);
            res.json({shows:shows, ids:ids,pagesCount:pagesCount});
        }
    );
};

exports.popular = function (req, res)
{
    async.waterfall(
        [
            function(callback)
            {
                UserShow.aggregate(
                    {
                        $group:
                        {

                            _id:"$show_id",
                            cnt:
                            {
                                $sum:1
                            }
                        }
                    },
                    {
                        $sort:
                        {
                            cnt:-1
                        }
                    },
                    {
                        $limit:10
                    },
                    function(err,res)
                    {
                        callback(err, res);
                    }
                );
            },
            function(resultShowsCount, callback)
            {
                var resultShowsCountLength = resultShowsCount.length;
                var showIds = [];
                for (var i=0; i<resultShowsCountLength;i++)
                {
                    showIds.push(resultShowsCount[i]['_id']);
                }

                Show.find({tvdb_id:{$in:showIds}},function(err, res){
                    callback(err, res);
                });
            },
        ],
        function(err,shows){
            var isGuest = res.locals.isGuest;
            res.json({shows:shows,isGuest: isGuest});
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
                    callback(null,'Show is added to your <a href="#/show/list">list</a> successfully');
                }
                else
                {
                    callback('error','Show is already added');
                }
            },
        ],
        function(err,result){
            var returnObject = {};
            returnObject.success = err === null;
            returnObject.message = result;
            res.json(returnObject);
        }
    );

};
exports.remove = function (req, res)
{
    var data = req.params;
    UserShow.remove({show_id:data.id},function(err){
        var returnObject = {};
        returnObject.success = true;
        returnObject.message = 'Show was removed from your <a href="#/show/list">list</a> successfully!';
        if (err)
        {
            returnObject.success = false;
            returnObject.message = 'Oops. Error! Show was not removed successfully!';
        }
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

exports.updateTrendShows = function(req, res)
{
    api.sendRequest(
        {
            url: '/shows/trending.json/',
            queryParams: {}
        },
        function (err, response, body)
        {
            var l = body.length;
            for(var i=0; i<l;i++)
            {
                body[i].trend = 1;
                Show.findOneAndUpdate({tvdb_id:body[i].tvdb_id},body[i],{upsert:true},function(err, show){});
            }
            res.json({status:'ok'});
        }
    );
};