var mongoose = require('mongoose');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var cfg = require('../config');
var config = cfg.loadConfig(cfg.appConfig);

var UserSchema = mongoose.Schema({
    name            : String,
    email           : String,
    password        : String,
    googleId        : String,
    salt            : String,
    email_notifier  :Number,
    vk_notifier     :Number,
    phone_notifier  :Number
});
UserSchema.methods = {
    encryptPassword: function(password)
    {
        return crypto.createHmac('sha1',this.salt).update(password).digest('hex');
    },
    makeSalt: function()
    {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    authenticate: function(password)
    {
        return this.encryptPassword(password) === this.password;
    }
};

UserSchema.methods = {
    setAttributes: function (data)
    {
        for (var a in this.schema.tree)
        {
            if (a === '_id' || a === '__v' || typeof a == 'undefined')
            {
                continue;
            }
            if (typeof data[a] !== 'undefined')
            {
                this[a] = data[a];
            }
        }
        return this;
    },
    sendNotifications: function(data, mailer)
    {
        var model = this.model('User');
        model.findById(data.user_id,function(err, user){
            if (user.email_notifier)
            {
                user.sendEmailMessage(user, data, mailer);
            }
            if (user.vk_notifier)
            {
                user.sendSocialMessage(user, data);
            }
            if (user.phone_notifier)
            {
                user.sendPhoneMessage(user, data);
            }
        });
    },
    sendEmailMessage: function(user, data, mailer)
    {
        console.log(data.episode_info.episode.images);
        mailer.send('email/episode_notification', {
            to: user.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: 'New Episode Notification', // REQUIRED.
            episode:data.episode_info,
            site_host:config.http.host
        }, function (err) {
            if (err) {
                // handle error
                console.log(err);
                return;
            }
            console.log('Email Sent');
        });
    },
    sendPhoneMessage: function(user, episode)
    {

    },
    sendSocialMessage: function(user, episode)
    {

    }
};

module.exports = mongoose.model('User',UserSchema);