var mongoose = require('mongoose');
var crypto = require('crypto');

var UserSchema = mongoose.Schema({
    name     : String,
    email    : String,
    password : String,
    googleId : String,
    salt     : String
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

module.exports = mongoose.model('User',UserSchema);