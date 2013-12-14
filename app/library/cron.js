var cronJob = require('cron').CronJob;
var show = require('../controllers/show');
var dateformat = require('dateformat');
var jobs = {
    runDailyEpisodesCheck: function (req, res)
    {
        //every 8 hours every day
        new cronJob('5 00 * * *', function(){
            var now = new Date();
            var currentDate = dateformat(now,'yyyy-mm-dd h:i:s');
            console.log(currentDate);
            show.checkNewEpisodes(req, res);
        }, null, true, "Europe/Kiev");
//        show.checkNewEpisodes(req, res);
}
};

exports.runJobs = function (req, res)
{
    jobs.runDailyEpisodesCheck(req, res);
};
