var mongoose = require('mongoose');

var EpisodeSchema = mongoose.Schema({
    season          :Number,
    episode         :Number,
    number          :Number,
    tvdb_id         :Number,
    title           :String,
    overview        :String,
    first_aired     :Number,
    first_aired_iso :String,
    first_aired_utc :Number,
    url             :String,
    screen          :String,
    rating_advanced :Number,
    show_id         :Number,
    images          :mongoose.Schema.Types.Mixed,
    ratings         :mongoose.Schema.Types.Mixed
});

EpisodeSchema.methods = {
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
module.exports = mongoose.model('Episode',EpisodeSchema);