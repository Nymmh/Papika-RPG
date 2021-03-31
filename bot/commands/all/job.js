let joblist = require('../../global/joblist'),
job = require('../../global/job');
module.exports = {
    desc: "Job global modifier",
    aliases: ['j'],
    usage: "job [command/help]",
    cooldown: 15,
    guildOnly: true,
    task(Ai, msg, suffix){
        if(suffix == "list")joblist.joblist(Ai,msg);
        else if(suffix == "quit")job.jobquit(Ai,msg);
        else if(suffix == "apply")job.jobapply(Ai,msg);
    }
}