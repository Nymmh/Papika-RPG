let job = require('../../global/job');
module.exports = {
    desc: "Quit your job",
    aliases: ['jquit', 'quitjob'],
    cooldown: 5,
    guildOnly: true,
    channel: "job",
    task(Ai, msg){job.jobquit(Ai, msg);}
}