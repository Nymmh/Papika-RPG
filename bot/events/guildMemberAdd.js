let config = require('../json/config.json'),
    axios = require('axios'),
    reload = require('require-reload')(require),
    logger = new(reload('../util/logger.js'))(config.logTimestamp);
module.exports = (Ai,member, guild)=>{
    if(!member.user.bot){
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                mutation($auth: String, $discordId: String, $name: String, $avatar: String) {
                    createUser(auth: $auth, discordId: $discordId, name: $name, avatar: $avatar) {
                      discordId
                    }
                  }                  
                `,
                variables:{
                    auth:config.APIAuth,
                    discordId:member.user.id,
                    name:member.user.username,
                    avatar:member.user.avatar
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(()=>{
            logger.green(`New User Created for ${member.user.id} >> ${member.user.username}`);
            member.user.getDMChannel().then(dmch=>{
                dmch.createMessage("Welcome to Papika RPG, check out the #getting-started channel to learn how to play.").catch(err => {handleError(Ai, __filename, msg.channel, err)});
            }).catch(err => {handleError(Ai, __filename, msg.channel, err)});;
        });
    }
}