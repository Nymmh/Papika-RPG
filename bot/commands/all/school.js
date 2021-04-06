const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils'),
      moment = require('moment'),
      cooldowns = reload('../json/cooldowns.json');
let {handleBills} = require('../../global/utils/handleBills');
module.exports = {
    desc: "School for better jobs",
    aliases: ['sc', 'class'],
    usage: "[apply/attend/list/quit] <classname>",
    cooldown: 5,
    guildOnly: true,
    channel:"school",
    task(Ai, msg, suffix){
        if(!suffix) return 'wrong usage';
        let options = suffix.split(" ");
        if(options[0] == "list"){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query{
                        schools{
                          name
                          price
                          days
                        }
                      }
                    `,
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                let sndmsg = "",
                    schools = result.data.data.schools;
                for(let sc in schools){
                    sndmsg += `**${schools[sc].name}** >> Price: ${schools[sc].price} > Days: ${schools[sc].days}\n`;
                }
                return Ai.createMessage(msg.channel.id,sndmsg).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            });
        }else if(options[0] == "quit"){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            currentSchool
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
                if(result.data.data.users[0].currentSchool == undefined || result.data.data.users[0].currentSchool == "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are currently not in school.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                else{
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth: String, $discordId: String, $reason: String, $value: String) {
                               modifyUser(auth: $auth, discordId: $discordId, reason: $reason, value: $value) {
                                  discordId
                                }
                              }                  
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                reason:"schoolquit",
                                value:""
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you quit going to school for ${result.data.data.users[0].currentSchool}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    });
                }
            });
        }else if(options[0] == "apply"){
            if(!options[1])return 'wrong usage';
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            money
                            currentSchool
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
                    money = users.money;
                if(users.currentSchool !== null && users.currentSchool !== '')return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are already in school for ${users.currentSchool}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        query($name:String){
                            schools(name:$name){
                              name
                              price
                              days
                            }
                          }
                        `,
                        variables:{
                            name:options[1].charAt(0).toUpperCase() + options[1].slice(1)
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(result=>{
                    let price = result.data.data.schools[0].price;
                    if(money<price)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you dont have enough ${config.moneyname}'s to apply to ${options[1]}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth: String, $discordId: String, $reason: String, $value: String) {
                               modifyUser(auth: $auth, discordId: $discordId, reason: $reason, value: $value) {
                                  discordId
                                }
                              }                  
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                reason:"schoolapply",
                                value:options[1]
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{}).then(()=>{
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are now in school for ${options[1]}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    });
                })
            });
        }else if(options[0] == "attend"){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            money
                            schoolDays
                            currentSchool
                            lastSchool
                            happiness
                            sleep
                            hunger
                            nextbill
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
                let currentSchool = result.data.data.users[0].currentSchool;
                if(currentSchool == undefined || currentSchool == "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are currently not in school.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                let lastschool = result.data.data.users[0].lastSchool
                if((moment().unix() - Number(lastschool)) < cooldowns.school) return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you can't attend class for another ${Math.abs(((moment().unix() - Number(lastschool))-cooldowns.work))} seconds.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                let schoolDays = result.data.data.users[0].schoolDays,
                    happiness = result.data.data.users[0].happiness,
                    sleep = result.data.data.users[0].sleep,
                    hunger = result.data.data.users[0].hunger,
                    nextbill = result.data.data.users[0].nextbill,
                    money = result.data.data.users[0].money,
                    randomSleep = utils.getRandomInt(5,20),
                    randomHunger = utils.getRandomInt(1,15),
                    randomHappiness = utils.getRandomInt(1,5),
                    schoolDone = false;
                nextbill = (nextbill-1);
                schoolDays = (schoolDays - 1);
                happiness = (happiness - randomHappiness);
                sleep = (sleep-randomSleep);
                hunger = (hunger-randomHunger);
                if(nextbill == 0)handleBills(Ai,msg,money);
                if(schoolDays == 0)schoolDone = true;
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        mutation($auth: String, $discordId: String, $hunger: Int, $happiness: Int, $sleep: Int, $nextbill: Int, $schoolDays: Int) {
                            UserSchool(auth: $auth, discordId: $discordId, hunger: $hunger, happiness: $happiness, sleep: $sleep, nextbill: $nextbill, schoolDays: $schoolDays) {
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
                            nextbill:nextbill,
                            schoolDays:schoolDays,
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    if(schoolDone){
                        axios({
                            url:config.APIurl,
                            method:'post',
                            data:{
                                query:`
                                mutation($auth: String, $discordId: String, $reason: String, $value: String) {
                                   modifyUser(auth: $auth, discordId: $discordId, reason: $reason, value: $value) {
                                      discordId
                                    }
                                  }                  
                                `,
                                variables:{
                                    auth:config.APIAuth,
                                    discordId:msg.author.id,
                                    reason:"schooldone",
                                    value:currentSchool
                                },
                                headers:{
                                    'Content-Type':'application/json'
                                },
                            }
                        }).then(()=>{
                            return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you finished your schooling for ${currentSchool}`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                        });
                    }else return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, only ${schoolDays} days of class left.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                });
            });
        }
    }
}