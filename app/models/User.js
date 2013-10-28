var mongoose = require('mongoose');
var crypto = require('crypto');

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
    }
};

module.exports = mongoose.model('User',UserSchema);