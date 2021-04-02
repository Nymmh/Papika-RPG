let job = require('../../global/job');
module.exports = {
    desc: "Apply to a job job",
    aliases: ['japply', 'applyjob'],
    usage: "[apply] [Job Name]",
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg, suffix){
        if (!suffix) return 'wrong usage';
        job.jobapply(Ai, msg, suffix)
    }
}