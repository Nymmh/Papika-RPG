let job = require('../../global/job');
module.exports = {
    desc: "Quit your job",
    aliases: ['jquit', 'quitjob'],
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg){job.jobquit(Ai, msg);}
}