let job = require('../../global/job');
const handleError = require('../../util/utils.js').handleError;
module.exports = {
    desc: "Work at your job",
    aliases: ['wk', 'work'],
    cooldown: 1,
    guildOnly: true,
    channel: "job",
    task(Ai, msg){job.jobwork(Ai, msg);}
}