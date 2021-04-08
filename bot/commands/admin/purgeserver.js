const findMember = require('../../util/utils.js').findMember,
    axios = require('axios');
    config = require('../../json/config.json'),
    utils = require('../../util/utils');
module.exports = {
    desc: "Purge server",
	aliases: ['pserver'],
    cooldown: 60,
    guildOnly: true,
    requiredAccess: "Admin",
    task(Ai, msg){
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                mutation($auth:String){
                    purgeServer(auth:$auth){
                      discordId
                    }
                  }
                `,
                variables:{
                    auth:config.APIAuth
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(()=>{
            new Map(msg.guild.members).forEach(getMembers)
            function getMembers(value, keys, map){
                let discordid = value.user.id,
                    isBot = value.user.bot,
                    username = value.user.username,
                    avatar = value.user.avatar;
                    if(!isBot){
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
                                    discordId:discordid,
                                    name:username,
                                    avatar:avatar
                                },
                                headers:{
                                    'Content-Type':'application/json'
                                },
                            }
                        }).then(()=>{
                            logger.green(`New User Created for ${discordid} >> ${username}`);
                        });
                    }
            }
        });
    }
}