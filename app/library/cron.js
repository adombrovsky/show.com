var cronJob = require('cron').CronJob;
var show = require('../controllers/show');

var jobs = {
    runDailyEpisodesCheck: function (req, res)
    {
        //every 8 hours every day
//        new cronJob('5 */8 * * *', function(){
//            show.checkNewEpisodes(req, res);
//        }, null, true, "Europe/Kiev");
        show.checkNewEpisodes(req, res);
    }
};

exports.runJobs = function (req, res)
{
    jobs.runDailyEpisodesCheck(req, res);
};