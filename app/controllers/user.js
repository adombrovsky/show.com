var User = require('../models/User');

exports.index = function (req, res)
{
    if (req.isUnauthenticated() || typeof req.user == 'undefined')
    {
        res.redirect('/');
        return ;
    }
    User.findOne({email:req.user.email, googleId:req.user.googleId},function(err, user){
        if (err)
        {

        }
        if (!user)
        {

        }

        res.render('user/profile',user);

    });
};

exports.updateProfile = function (req, res)
{
    var userData = req.body;
    var returnObject = {};
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
        user.save();
        returnObject.success = true;
        returnObject.action = 'reload';
        var returnObjectString = JSON.stringify(returnObject);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(returnObjectString);
    });

};