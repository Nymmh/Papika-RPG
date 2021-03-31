const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils'),
      moment = require('moment');
module.exports = {
    desc: "Sleep (＿ ＿*) Z z z",
    aliases: ['sl'],
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg){
    /**
     * perm checks
     * @param {boolean} sendMessages
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    if (sendMessages === false) return;
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($discordId:String){
                users(discordId:$discordId){
                  sleep
                  happiness
                  hunger
                  lastsleep
                  inventory{
                    discordId
                    bed{
                      sleep
                      cooldown
                      badsleep
                      badsleepmax
                    }
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
            userLastSleep = users.lastsleep,
            sleep = users.sleep,
            bedSleep = users.inventory[0].bed[0].sleep,
            newSleep = (sleep+bedSleep);
            happiness = users.happiness,
            hunger = users.hunger,
            bedCooldown = users.inventory[0].bed[0].cooldown,
            bedBadSleep = users.inventory[0].bed[0].badsleep,
            badSleep = utils.getRandomInt(0,100),
            badSleepMax = users.inventory[0].bed[0].badsleepmax,
            badnightSleep = false;
        if(sleep>=100)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you cant sleep anymore.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        if(newSleep>100)newSleep = 100;
        if(badSleep<=bedBadSleep){
            let randbadsleep = utils.getRandomInt(0,badSleepMax),
                randHapLost = utils.getRandomInt(0,5);
            newSleep = (newSleep - randbadsleep);
            happiness = (happiness-randHapLost);
            badnightSleep = true;
        }else{
            let randHappiness = utils.getRandomInt(0,3);
            happiness = (happiness+randHappiness);
        }
        if(!userLastSleep || userLastSleep == '' || (moment().unix() - Number(userLastSleep)) > bedCooldown){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    mutation($auth:String,$discordId:String,$sleep:Int,$happiness:Int,$hunger:Int,$reason:String){
                        UserSleep(auth:$auth,discordId:$discordId,sleep:$sleep,happiness:$happiness,hunger:$hunger,reason:$reason){
                          sleep
                          happiness
                        }
                      }
                    `,
                    variables:{
                        auth:config.APIAuth,
                        discordId:msg.author.id,
                        sleep:newSleep,
                        happiness:happiness,
                        hunger:hunger,
                        reason:"sleep"
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                if(badnightSleep) sndmsg = `<@${msg.author.id}>, you had a bad nights sleep and gained ${(newSleep-sleep)} sleep.`;
                else sndmsg = `<@${msg.author.id}>, you had a good nights sleep and gained ${bedSleep} sleep.`;
                Ai.createMessage(msg.channel.id,sndmsg).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            });
        }else {
            return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you cant sleep for another ${Math.abs(((moment().unix() - Number(userLastSleep))-bedCooldown))} seconds.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        }
    });
    }
}