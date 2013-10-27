var mongoose = require('mongoose');

var UserShowSchema = mongoose.Schema({
    user_id     :String,
    show_id     :String
});

UserShowSchema.methods = {};

UserShowSchema.index({user_id: 1, show_id: 1}, {unique: true});

module.exports = mongoose.model('UserShow',UserShowSchema);