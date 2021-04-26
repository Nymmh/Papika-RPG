const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "Check your addictions",
    aliases: ['add'],
    cooldown: 10,
    task(Ai, msg){
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                query($discordID:String){
                    users(discordId:$discordID){
                        nicotineAddiction
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
            let users = result.data.data.users[0],
                msgTemp = "";
            if(users.nicotineAddiction)msgTemp += `Nicotine\n`;
            if(msgTemp == "")return msg.author.getDMChannel().then(dmch=>{dmch.createMessage("You have no addictions.").catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            return msg.author.getDMChannel().then(dmch=>{dmch.createMessage("Addictions```"+msgTemp+"```").catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        });
    }
}