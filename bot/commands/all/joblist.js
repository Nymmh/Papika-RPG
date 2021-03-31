let joblist = require('../../global/joblist');
module.exports = {
    desc: "View the available jobs",
    aliases: ['jquit', 'jobq'],
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg){joblist.joblist(Ai, msg);}
}