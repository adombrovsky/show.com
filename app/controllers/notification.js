var User = require('../models/User');
var UserNotification = require('../models/UserNotification');

exports.index = function (req, res)
{
    UserNotification.find({user_id:req.user._id, unread:1},null,{limit:200, sort:{date:-1}},function(err, records){
        if (err)
        {

        }
        res.json(records);
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