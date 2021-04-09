const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "Take an item from your house",
    aliases: ['tk'],
    usage: "[item] <amount>",
    cooldown: 5,
    guildOnly: true,
    channel: "house",
    task(Ai, msg, suffix){
        if(!suffix) return 'wrong usage';
        let options = suffix.split(" ");
        if(options.length>=0){
            let option = options[0];
            if(options.length == 3)option = options[0].concat(' '+options[1]);
            let amount = 1;
            if(options[2])amount = Number(options[2]);
            else if(options[1])amount = Number(options[1]);
            if(amount == 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not take 0 of an item.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            if(amount % 1 != 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can only take whole numbers of items.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            let optionFix = option.replace(/(_)/g,' ').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g,lt=>lt.toUpperCase()).replace(/( )/g,'_');
            if(optionFix == "Fastfood")optionFix = "Fast_Food";
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($name:String){
                        items(name:$name){
                            price
                        }
                      }
                    `,
                    variables:{
                        name:optionFix
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                if(!result.data.data.items[0])return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>,`+" I could not find an item called ``"+optionFix+"``.").catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        query($discordID:String){
                            users(discordId:$discordID){
                                inventory{
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
                    if((result.data.data.users[0].inventory[0].usedSpace+amount)>result.data.data.users[0].inventory[0].maxSpace)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you dont have enough inventory space.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth:String,$discordId:String,$item:String,$amount:Int,$reason:String){
                                userStoreItem(auth:$auth,discordId:$discordId,item:$item,amount:$amount,reason:$reason){
                                  discordId
                                }
                              }
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                item:optionFix,
                                amount:amount,
                                reason:"take"
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you took ${amount} ${optionFix} from your house.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    })
                })
            })
        }
    }
}