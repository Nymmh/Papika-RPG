const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "Open the buy shop and buy shit",
    aliases: ['b'],
    usage: "<list> <group/food> <amount>",
    cooldown: 5,
    guildOnly: true,
    channel: "store",
    task(Ai, msg, suffix){
    /**
     * perm checks
     * @param {boolean} sendMessages
     * @param {boolean} embedLinks
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    if (sendMessages === false) return;
    if(!suffix) return 'wrong usage';
    let options = suffix.split(" ");
    let groups = ['food','bed'];
    if(options[0] == 'list'){
        if(!groups.includes(options[1]))return Ai.createMessage(msg.channel.id,`The options for ~buy list is `+"``"+`${groups}`+"``"+``).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                query($group:ItemGroup){
                    items(group:$group){
                        name
                        price
                        values{
                            usehappiness
                            hunger
                            sleep
                            happinessbuy
                            cooldown
                        }
                    }
                  }
                `,
                variables:{
                    group:options[1].charAt(0).toUpperCase() + options[1].slice(1)
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(result=>{
            let items = result.data.data.items,
            msgsend = "",
                valuemsg = "";
            for(let it in items){
                valuemsg = ""
                for(let vt in items[it].values){
                    if(items[it].values[vt].usehappiness)valuemsg += ` > Happiness on use >> ${items[it].values[vt].usehappiness}`;
                    if(items[it].values[vt].hunger)valuemsg += ` > Hunger gained >> ${items[it].values[vt].hunger}`;
                    if(items[it].values[vt].sleep)valuemsg += ` > Sleep gained >> ${items[it].values[vt].sleep}`;
                    if(items[it].values[vt].happinessbuy)valuemsg += ` > Happiness gained on buy >> ${items[it].values[vt].happinessbuy}`;
                    if(items[it].values[vt].cooldown)valuemsg += ` > Cooldown >> ${items[it].values[vt].cooldown}`;
                }
                msgsend += "```"+`${items[it].name} >> ${items[it].price}${config.moneyname}${valuemsg}\n`+"```";
            }
            return Ai.createMessage(msg.channel.id,msgsend).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        })
    }else if(!groups.includes(options[0])){
        if(options.length>=0){
            let option = options[0];
            if(options.length == 3)option = options[0].concat(' '+options[1]);
            let amount = 1;
            if(options[2])amount = Number(options[2]);
            else if(options[1])amount = Number(options[1]);
            if(amount % 1 != 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can only buy whole numbers of items.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            let optionFix = option.replace(/(_)/g,' ').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g,lt=>lt.toUpperCase()).replace(/( )/g,'_');
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($name:String){
                        items(name:$name){
                            price
                            values{
                                happinessbuy
                            }
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
                let price = result.data.data.items[0].price,
                    happinessonbuy = result.data.data.items[0].values[0].happinessbuy;
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
                        let users = result.data.data.users[0];
                        let cost = (price*amount);
                        if(users.money>=(price*amount)){
                            let newmoney = users.money-(price*amount),
                                newhappiness = users.happiness,
                                groceries = users.inventory[0].groceries,
                                fastfood = users.inventory[0].fastfood,
                                amountup = 0;
                            if(!groceries) groceries = 0;
                            if(!fastfood) fastfood = 0;
                            if(happinessonbuy)newhappiness+happinessonbuy;
                            if(users.inventory[0].bed[0].name == optionFix)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not buy a bed you already own.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            if(optionFix == "Groceries")amountup = groceries+amount;
                            else if (optionFix == "Fast_Food")amountup = fastfood+amount;
                            axios({
                                url:config.APIurl,
                                method:'post',
                                data:{
                                    query:`
                                    mutation($auth:String,$discordId:String,$money:Int,$happiness:Int,$item:String,$amount:Int){
                                        UserBuy(auth:$auth,discordId:$discordId,money:$money,happiness:$happiness,item:$item,amount:$amount){
                                          discordId
                                        }
                                      }
                                    `,
                                    variables:{
                                        auth:config.APIAuth,
                                        discordId:msg.author.id,
                                        money:newmoney,
                                        happiness:newhappiness,
                                        item:optionFix,
                                        amount:amountup
                                    },
                                    headers:{
                                        'Content-Type':'application/json'
                                    },
                                }
                            }).then(()=>{
                                return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You bought ${amount} ${optionFix} for ${cost}${config.moneyname}`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            })
                        }else return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You dont have enough ${config.moneyname} to buy ${optionFix} ${Math.abs(users.money-(price*amount))}`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    })
            })
        }
    }else return 'wrong usage';
    }
}