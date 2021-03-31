const handleError = require('../util/utils').handleError,
      axios = require('axios');
      config = require('../json/config.json');
module.exports.joblist = (Ai, msg)=>{
    /**
     * perm checks
     * @param {boolean} sendMessages
     * @param {boolean} embedLinks
     */
         const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
         const embedLinks = msg.channel.permissionsOf(Ai.user.id).has('embedLinks');
         if(sendMessages === false) return;
         if(embedLinks === false) return msg.channel.createMessage(`\\❌ I'm missing the \`embedLinks\` permission, which is required for this command to work.`)
           .catch(err => {
             handleError(Ai, __filename, msg.channel, err);
           });
         axios({
             url:config.APIurl,
             method:'post',
             data:{
                 query:`
                 query{
                     jobs(rank:1){
                       name
                       income
                       group
                     }
                   }
                 `,
                 headers:{
                     'Content-Type':'application/json'
                 },
             }
         }).then(result=>{
             let jobs = result.data.data.jobs,
                 jobmsg = "";
             for(let jb in jobs){
                 jobmsg += `**${jobs[jb].name}** >> Income: ${jobs[jb].income} > Job Tree: ${jobs[jb].group.replace("_"," ")}`;
             }
             Ai.createMessage(msg.channel.id,jobmsg).catch(err => {handleError(Ai, __filename, msg.channel, err)});
         });
}