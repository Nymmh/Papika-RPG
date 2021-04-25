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
    let groups = ['food','bed','house','user','vape'];
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
                            storage
                            rentCost
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
                    if(items[it].values[vt].storage)valuemsg += ` > Storage >> ${items[it].values[vt].storage}`;
                    if(items[it].values[vt].rentCost)valuemsg += ` > Rent >> ${items[it].values[vt].rentCost}`;
                }
                msgsend += "```"+`${items[it].name} >> ${items[it].price}${config.moneyname}${valuemsg}\n`+"```";
            }
            return Ai.createMessage(msg.channel.id,msgsend).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        })
    }else if(!groups.includes(options[0])){
        if(options.length>=0){
            let option = options[0];
            let optionFix = option.replace(/(_)/g,' ').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g,lt=>lt.toUpperCase()).replace(/( )/g,'_');
            var amount = 1;
            if(optionFix.match(/(Yubi_Juice_)/)){
                amount = 1;
                var strength = options[1];
            }else{
                if(options.length == 3)option = options[0].concat(' '+options[1]);
                if(options[2])amount = Number(options[2]);
                else if(options[1])amount = Number(options[1]);
                if(amount == 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not buy 0 of an item.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                if(optionFix == "Fastfood")optionFix = "Fast_Food";
            }
            if(amount % 1 != 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can only buy whole numbers of items.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
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
                let happinessonbuy = 0;
                let price = result.data.data.items[0].price;
                if(result.data.data.items[0].values[0])happinessonbuy = result.data.data.items[0].values[0].happinessbuy;
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            query($discordID:String){
                                users(discordId:$discordID){
                                  money
                                  happiness
                                  houseInventory{
                                    bed{
                                        name
                                    }
                                    house{
                                        name
                                    }
                                  }
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
                                amountup = 0,
                                usedSpace = users.inventory[0].usedSpace,
                                maxSpace = users.inventory[0].maxSpace;
                            if((usedSpace+amount)>maxSpace)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You don't have the inventory space to buy that many.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            if(!groceries) groceries = 0;
                            if(!fastfood) fastfood = 0;
                            if(happinessonbuy)newhappiness+happinessonbuy;
                            if(users.houseInventory[0].bed[0].name == optionFix)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not buy a bed you already own.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            if(users.houseInventory[0].house[0].name == optionFix)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not buy a house you already own.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            if(optionFix == "Groceries")amountup = groceries+amount;
                            else if (optionFix == "Fast_Food")amountup = fastfood+amount;
                            else if(optionFix == "Backpack" && users.inventory[0].backpack)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not buy 2 Backpacks.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            else if(optionFix == "Peko_Vape_mode" && users.inventory[0].vape[0].name)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You already have a vape mod.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            else if(optionFix.match(/(Yubi_Juice_)/) && users.inventory[0].vapejuice[0])return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You already have vape juice.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                            else amount = 1;
                            if(optionFix.match(/(Yubi_Juice_)/))amountup = Number(strength);
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