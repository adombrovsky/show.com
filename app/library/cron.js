var cronJob = require('cron').CronJob;
var show = require('../controllers/show');
var jobs = {
    runDailyEpisodesCheck: function (req, res)
    {
        //at 00.05 every day
        new cronJob('5 00 * * *', function(){
            show.checkNewEpisodes(req, res);
        }, null, true, "Europe/Kiev");
    },
    runDailyTrendUpdate: function (req, res)
    {
        //at 02.05 every day
        new cronJob('00 02 * * *',function(){
            show.updateTrendShows(req, res);
        }, null, true, "Europe/Kiev");
    }
};

exports.runJobs = function (req, res)
{
    jobs.runDailyEpisodesCheck(req, res);
    jobs.runDailyTrendUpdate(req, res);
};
