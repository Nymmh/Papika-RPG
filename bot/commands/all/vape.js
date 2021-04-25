const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "I bet you drive a Subi",
    aliases: ['vp'],
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg){
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                query($discordID:String){
                    users(discordId:$discordID){
                        inventory{
                            vape{
                                name
                            }
                            vapejuice{
                                name
                            }
                            vapejuiceStrength{
                                name
                            }
                            vapejuiceRemaining
                        }
                    }
                  }
                `,
                variables:{
                    discordID:msg.author.id
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(result=>{
            if(!result.data.data.users[0].inventory[0].vape[0])return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you dont have a vape.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            else if(!result.data.data.users[0].inventory[0].vapejuice[0])return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you dont have any vape juice.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            else if(result.data.data.users[0].inventory[0].vapejuiceRemaining == 0){
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        mutation($auth: String, $discordId: String, $reason: String, $value: String) {
                           modifyUser(auth: $auth, discordId: $discordId, reason: $reason, value: $value) {
                              discordId
                            }
                          }                  
                        `,
                        variables:{
                            auth:config.APIAuth,
                            discordId:msg.author.id,
                            reason:"novapejuiceleft",
                            value:""
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    logger.green(`User Change for ${msg.author.id} >> ${msg.author.username}`);
                    return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you dont have any vape juice left.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                });
            }else{
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        mutation($auth: String, $discordId: String, $reason: String, $value: String) {
                           modifyUser(auth: $auth, discordId: $discordId, reason: $reason, value: $value) {
                              discordId
                            }
                          }                  
                        `,
                        variables:{
                            auth:config.APIAuth,
                            discordId:msg.author.id,
                            reason:"vapehit",
                            value:""
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    logger.green(`User Change for ${msg.author.id} >> ${msg.author.username}`);
                    return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, 🌬️`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                }); 
            }
        })
    }
}