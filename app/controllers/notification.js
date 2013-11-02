var User = require('../models/User');
var UserNotification = require('../models/UserNotification');
var dateformat = require('dateformat');

exports.index = function (req, res)
{
    UserNotification.find({user_id:req.user._id, unread:1},null,{limit:200},function(err, records){
        if (err)
        {

        }
        res.render('notification/index',{notifications:records,pretty:false});
    });
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
        if (err)
        {

        }
        res.json(200, { message: 'Notification is marked as read', success:true, popup:true })
    });
};