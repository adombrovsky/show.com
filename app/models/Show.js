var mongoose = require('mongoose');

var ShowSchema = mongoose.Schema({
    title           : String,
    year            : Number,
    url             : String,
    first_aired     : Number,
    country         : String,
    overview        : String,
    runtime         : Number,
    network         : String,
    air_day         : String,
    air_time        : String,
    imdb_id         : String,
    tvdb_id         : String,
    tvrage_id       : String,
    last_updated    : Number,
    images          : mongoose.Schema.Types.Mixed,
    ratings         : mongoose.Schema.Types.Mixed,
    genres          : [],
    trend           : Number
});

ShowSchema.methods = {
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
module.exports = mongoose.model('Show',ShowSchema);