var User = require('../models/User');
var UserNotification = require('../models/UserNotification');
var async = require('async');

exports.index = function (req, res)
{
    var page = req.params.page - 1;
    var itemPerPage = 15;
    var skip = page * itemPerPage;

    async.parallel(
        [
            function(callback)
            {
                UserNotification.find({user_id:req.user._id, unread:1},null,{limit:itemPerPage, skip:skip, sort:{date:-1}},function(err, records){
                    if (err) callback(err);
                    callback(err, {shows:records});
                });
            },
            function(callback)
            {
                UserNotification.count({user_id:req.user._id, unread:1},function(err, count){
                    if (err) callback(err);
                    callback(err, {count:count});
                });
            }
        ],
        function(err,result)
        {
            var pagesCount = Math.ceil(result[1].count/itemPerPage);
            res.json({records:result[0].shows,pagesCount:pagesCount});
        }
    );



   /* UserNotification.find({user_id:req.user._id, unread:1},null,{limit:itemPerPage, skip:skip, sort:{date:-1}},function(err, records){
        if (err)
        {

        }
        var pagesCount = Math.ceil(records.length/itemPerPage);
        console.log(records.length);
        console.log(itemPerPage);
        res.json({records:records,pagesCount:pagesCount});
    });*/
};

exports.getUserNotifications = function (req, res)
{
    UserNotification.count({user_id:req.user._id, unread:1}, function (err, count) {
        if (err)
        {

        }
        res.json(200, { n_count: count, success:true })
    });
};

exports.setAsRead = function (req, res)
{
    var id = req.body.id;
    var query = {user_id:req.user._id};
    if (id)
    {
        query._id = id;
    }

    UserNotification.update(query,{unread:0},{multi:true},function(err,r){
        var data = {
            message: 'Notification is marked as read',
            success: true
        };
        if (err)
        {
            data.success = false;
            data.message = 'Oops! Error, you can\'t mark notification as read!';
        }
        res.json(200, data);
    });
};