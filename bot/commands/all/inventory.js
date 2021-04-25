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
                        groceries
                        fastfood
                        usedSpace
                        maxSpace
                        backpack
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
                    houseInventory{
                        house{
                            name
                        }
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
            invmsgTemp = "",
            houseinvTemp = "";
        let housename = result.data.data.users[0].houseInventory[0].house[0].name;
        for(let iv in result.data.data.users[0].inventory){
            if(result.data.data.users[0].inventory[iv].backpack)invmsgTemp += `Backpack\n`;
            if(result.data.data.users[0].inventory[iv].vape[0].name)invmsgTemp += `Vape Mod >> ${result.data.data.users[0].inventory[iv].vape[0].name}\n`;
            if(result.data.data.users[0].inventory[iv].vapejuice[0].name)invmsgTemp += `Vape Juice >> ${result.data.data.users[0].inventory[iv].vapejuice[0].name} > ${result.data.data.users[0].inventory[iv].vapejuiceStrength[0].name.replace('nic','')}mg > ${result.data.data.users[0].inventory[iv].vapejuiceRemaining}ml Remaining\n`;
            if(result.data.data.users[0].inventory[iv].groceries)invmsgTemp += `Groceries >> ${result.data.data.users[0].inventory[iv].groceries}\n`;
            if(result.data.data.users[0].inventory[iv].fastfood)invmsgTemp += `Fast Food >> ${result.data.data.users[0].inventory[iv].fastfood}\n`;
        }
        for(let iv in result.data.data.users[0].houseInventory){
            let keys = Object.keys(result.data.data.users[0].houseInventory[iv]);
            for(let ky in keys){
                if(keys[ky] == "bed")invmsgPerm += result.data.data.users[0].houseInventory[iv].bed[0].name;
            }
            if(result.data.data.users[0].houseInventory[iv].groceries)houseinvTemp += `Groceries >> ${result.data.data.users[0].houseInventory[iv].groceries}\n`;
            if(result.data.data.users[0].houseInventory[iv].fastfood)houseinvTemp += `Fast Food >> ${result.data.data.users[0].houseInventory[iv].fastfood}\n`;
        }
        if(invmsgTemp == '')invmsgTemp = "Empty";
        msg.author.getDMChannel().then(dmch=>{dmch.createMessage("Inventory "+result.data.data.users[0].inventory[0].usedSpace+"/"+result.data.data.users[0].inventory[0].maxSpace+"\n"+invmsgst+invmsgTemp+invmsged).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        return msg.author.getDMChannel().then(dmch=>{dmch.createMessage(housename+" inventory "+result.data.data.users[0].houseInventory[0].usedSpace+"/"+result.data.data.users[0].houseInventory[0].maxSpace+"\n"+invmsgst+houseinvTemp+invmsgPerm+invmsged).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    });
    }
}