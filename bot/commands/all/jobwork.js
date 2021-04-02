let job = require('../../global/job');
module.exports = {
    desc: "Work at your job",
    aliases: ['jwork', 'work'],
    cooldown: 20,
    guildOnly: true,
    task(Ai, msg){job.jobwork(Ai, msg);}
}