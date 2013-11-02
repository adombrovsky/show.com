var mongoose = require('mongoose');

var UserNotificationSchema = mongoose.Schema({
    title           : String,
    text            : String,
    date            : String,
    user_id         : String,
    type_id         : Number,
    unread          : { type: Number, min: 0, max: 1 },
    episode_info    : mongoose.Schema.Types.Mixed
});

UserNotificationSchema.methods = {
    setAttributes: function (data)
    {
        for (var a in this.schema.tree)
        {
            if (a === '_id' || a === '__v' || typeof a == 'undefined')
            {
                continue;
            }
            this[a] = data[a] || null;
        }
        return this;
    },
    getNotificationTypes: function (key)
    {
        var types =  {1:'New episode notification'};

        return key ? types[key] : types;
    }
};

module.exports = mongoose.model('UserNotification',UserNotificationSchema);