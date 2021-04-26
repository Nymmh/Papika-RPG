const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "Sell ur shit back to the store for an unfair price",
    aliases: ['s'],
    usage: "<item> <amount>",
    cooldown: 5,
    guildOnly: true,
    channel: "store",
    task(Ai,msg,suffix){
        if(!suffix) return 'wrong usage';
        let options = suffix.split(" "),
            amount = 1;
        let optionFix = options[0].replace(/(_)/g,' ').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g,lt=>lt.toUpperCase()).replace(/( )/g,'_');
        if(options.length == 2)option = options[0].concat(' '+options[1]);
        if(options[2])amount = Number(options[2]);
        else if(options[1])amount = Number(options[1]);
        if(amount == 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not sell 0 of an item.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        if(optionFix == "Fastfood")optionFix = "Fast_Food";
        if(amount % 1 != 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can only sell whole numbers of items.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                query($name:String){
                    items(name:$name){
                        price
                        cansell
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
            let items = result.data.data.items[0];
            if(!items)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>,`+" I could not find an item called ``"+optionFix+"``.").catch(err => {handleError(Ai, __filename, msg.channel, err)});
            if(!items.cansell)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>,`+" you can not sell ``"+optionFix+"``.").catch(err => {handleError(Ai, __filename, msg.channel, err)});
            let price = Math.floor((items.price/1.5));
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordID:String){
                        users(discordId:$discordID){
                          money
                          happiness
                          inventory{
                            groceries
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
                let users = result.data.data.users[0];
                let cost = Math.floor((price*amount));
                let newmoney = (users.money+cost),
                    happiness = users.happiness,
                    groceries = users.inventory[0].groceries,
                    amountdown = 0;
                if(optionFix == "Groceries"){
                    if(groceries == 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you cant sell that many.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    amountdown = (groceries-amount);
                }
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        mutation($auth:String,$discordId:String,$money:Int,$happiness:Int,$item:String,$amount:Int,$reason:String){
                            UserBuy(auth:$auth,discordId:$discordId,money:$money,happiness:$happiness,item:$item,amount:$amount,reason:$reason){
                              discordId
                            }
                          }
                        `,
                        variables:{
                            auth:config.APIAuth,
                            discordId:msg.author.id,
                            money:newmoney,
                            happiness:happiness,
                            item:optionFix,
                            amount:amountdown,
                            reason:"sell"
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You sold ${amount} ${optionFix} for ${cost}${config.moneyname}`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                })
            });
        });
    }
}