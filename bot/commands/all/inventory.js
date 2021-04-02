const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json');
module.exports = {
    desc: "Look at your inventory",
    aliases: ['iv', 'inv'],
    cooldown: 10,
    guildOnly: false,
    task(Ai, msg){
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($discordID:String){
                users(discordId:$discordID){
                    inventory{
                        bed{
                            name
                        }
                        groceries
                        fastfood
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
        let invmsgst = "```",
            invmsged = "```",
            invmsgPerm = "",
            invmsgTemp = "";
        for(let iv in result.data.data.users[0].inventory){
            let keys = Object.keys(result.data.data.users[0].inventory[iv]);
            for(let ky in keys){
                if(keys[ky] == "bed")invmsgPerm += result.data.data.users[0].inventory[iv].bed[0].name;
            }
            if(result.data.data.users[0].inventory[iv].groceries)invmsgTemp += `Groceries >> ${result.data.data.users[0].inventory[iv].groceries}\n`;
            if(result.data.data.users[0].inventory[iv].fastfood)invmsgTemp += `Fast Food >> ${result.data.data.users[0].inventory[iv].fastfood}\n`;
        }
        return msg.author.getDMChannel().then(dmch=>{dmch.createMessage("Inventory\n"+invmsgst+invmsgTemp+invmsgPerm+invmsged).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    });
    }
}