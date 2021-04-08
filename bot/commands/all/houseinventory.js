const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json');
module.exports = {
    desc: "Look at your house inventory",
    aliases: ['hiv', 'hinv'],
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
                    houseInventory{
                        bed{
                            name
                        }
                        groceries
                        fastfood
                        usedSpace
                        maxSpace
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
        for(let iv in result.data.data.users[0].houseInventory){
            let keys = Object.keys(result.data.data.users[0].houseInventory[iv]);
            for(let ky in keys){
                if(keys[ky] == "bed")invmsgPerm += result.data.data.users[0].houseInventory[iv].bed[0].name;
            }
            if(result.data.data.users[0].houseInventory[iv].groceries)invmsgTemp += `Groceries >> ${result.data.data.users[0].houseInventory[iv].groceries}\n`;
            if(result.data.data.users[0].houseInventory[iv].fastfood)invmsgTemp += `Fast Food >> ${result.data.data.users[0].houseInventory[iv].fastfood}\n`;
        }
        return msg.author.getDMChannel().then(dmch=>{dmch.createMessage("House inventory "+result.data.data.users[0].houseInventory[0].usedSpace+"/"+result.data.data.users[0].houseInventory[0].maxSpace+"\n"+invmsgst+invmsgTemp+invmsgPerm+invmsged).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    });
    }
}