var mongoose = require('mongoose');

var SeasonSchema = mongoose.Schema({
    show_id     : Number,
    season      : Number,
    episodes    : Number,
    url         : String,
    images      : mongoose.Schema.Types.Mixed
});

SeasonSchema.methods = {
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
module.exports = mongoose.model('Season',SeasonSchema);