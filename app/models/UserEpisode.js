var mongoose = require('mongoose');

var UserEpisodeSchema = mongoose.Schema({
    season          :Number,
    episode         :Number,
    show_id         :String,
    user_id         :String
});

UserEpisodeSchema.methods = {
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
    }
};
module.exports = mongoose.model('UserEpisode',UserEpisodeSchema);