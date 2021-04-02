const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "Eat food",
    aliases: ['e'],
    usage: "[food] <full>",
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg, suffix){
    /**
     * perm checks
     * @param {boolean} sendMessages
     * @param {boolean} embedLinks
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    if (sendMessages === false) return;
    if(!suffix) return 'wrong usage';
    let options = suffix.split(" "),
    food = options[0],
    full = false;
    if(options[1]){
        if(options[1].toLowerCase() != "full"){
            if(options[2] && options[2].toLowerCase() == "full")full = true;food = options[0].concat(' '+options[1]);
        }else if(options[1].toLowerCase() == "full")full = true;
    }
    let item = food.replace(/(_)/g,' ').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g,lt=>lt.toUpperCase()).replace(/( )/g,'_');
    console.log(item)
    console.log(full)
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($discordId:String){
                users(discordId:$discordId){
                  hunger
                  happiness
                  sleep
                  inventory{
                    bed{
                      name
                    }
                    groceries
                  }
                }
              }
            `,
            variables:{
                discordId:msg.author.id
            },
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(result=>{
        let users = result.data.data.users[0],
        groceries = result.data.data.users[0].inventory[0].groceries,
        hunger = users.hunger,
        happiness = users.happiness,
        sleep = users.sleep;
        query = "";
        if(hunger>=100)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can't eat anymore.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        if(item == "Groceries"){
            if(groceries == 0)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You dont have any groceries.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            query = `
                query($name:String){
                    items(name:$name){
                        values{
                        usehappiness
                        hunger
                        sleep
                        }
                    }
                }
            `;
        }
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:query,
            variables:{
                name:item
            },
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(result=>{
        let eatmsg = "",
            sleepmsg = "",
            happinessmsg = "";
        let items = result.data.data.items[0].values[0],
            eatcount = 1,
            itemsleft = 0;
        if(full){
            eatcount = Math.ceil((100-hunger)/items.hunger);
            if(eatcount>groceries)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You dont have enough ${item.toLowerCase()} to be full.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        }
        happiness = ((eatcount*items.usehappiness)+happiness);
        hunger = ((eatcount*items.hunger)+hunger)
        if(hunger>100)hunger=100;
        if(items.sleep)if(items.sleep>0)sleep = ((eatcount*items.sleep)+sleep);
        if(item == "Groceries")itemsleft = (groceries-eatcount);
        if(items.usehappiness>0) happinessmsg = `, ${(eatcount*items.usehappiness)} happiness`;
        if(items.sleep)sleepmsg = `, ${(eatcount*items.sleep)} sleep`;
        eatmsg = `<@${msg.author.id}>, You ate ${eatcount} ${item.toLowerCase()} and gained ${(eatcount*items.hunger)} hunger${happinessmsg}${sleepmsg}.`;
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                mutation($auth: String, $discordId: String, $hunger: Int, $happiness: Int, $sleep: Int, $item: String, $itemsleft: Int) {
                    UserEat(auth: $auth, discordId: $discordId, hunger: $hunger, happiness: $happiness, sleep:$sleep item: $item, itemsleft: $itemsleft) {
                        discordId
                    }
                } 
                `,
                variables:{
                    auth:config.APIAuth,
                    discordId:msg.author.id,
                    hunger:hunger,
                    happiness:happiness,
                    sleep:sleep,
                    item:item,
                    itemsleft:itemsleft
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(()=>{return Ai.createMessage(msg.channel.id,eatmsg).catch(err => {handleError(Ai, __filename, msg.channel, err)});})
    });
    });
    }
}