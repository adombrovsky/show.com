var User = require('../models/User');

exports.index = function (req, res)
{
    if (req.isUnauthenticated() || typeof req.user == 'undefined')
    {
        res.redirect('/');
        return ;
    }
    User.findOne(
        {
            email:req.user.email,
            googleId:req.user.googleId
        },
        {
            'name':true,
            'email':true,
            'password':true
        },
        function(err, user){
        if (err || !user)
        {

        }
        res.json(user);

    });
};

exports.updateProfile = function (req, res)
{
    var userData = req.body;
    User.findOne({email:req.user.email, googleId:req.user.googleId},function(err, user){
        if (err)
        {

        }
        if (!user)
        {

        }

        user.email = userData.email;
        user.name = userData.name;
        if (userData.password !== '')
        {
            user.password = user.encryptPassword(userData.password);
        }
        user.save(function(err){
            var returnObject = {};
            returnObject.success = true;
            returnObject.message = 'Profile was updated successfully!';
            if (err)
            {
                returnObject.success = false;
                returnObject.message = 'Oops. Error! Profile was not updated successfully!';
            }
            res.json(returnObject);
        });
    });

};

exports.settings = function (req, res)
{
    User.findOne({email:req.user.email},function(err, settings){
        res.json(settings);
    });
};

exports.updateSettings = function (req, res)
{
    var userSettings = req.body;
    User.findOne({email:req.user.email},function(err, record){
        if (!record){}

        record.email_notifier = userSettings.email_notifier ? 1:0;
        record.vk_notifier = userSettings.vk_notifier ? 1:0;
        record.phone_notifier = userSettings.phone_notifier ? 1:0;
        record.save(function(){
            var returnObject = {};
            returnObject.success = true;
            returnObject.message = 'User settings were updated successfully!';
            if (err)
            {
                returnObject.success = false;
                returnObject.message = 'Oops. Error! User settings were not updated successfully!';
            }
            res.json(returnObject);
        });
    });
};