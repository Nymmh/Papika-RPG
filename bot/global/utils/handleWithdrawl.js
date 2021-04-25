let axios = require('axios'),
    config = require('../../json/config.json');

function nicotineWithdrawl(Ai,msg,newHappiness,nicotineWithdrawldays){
    nicotineWithdrawldays = (nicotineWithdrawldays+1);
    if(nicotineWithdrawldays >= 2){
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                query{
                    addictions(name:"nicotine"){
                        withdrawlhappiness
                    }
                  }           
                `,
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(result=>{
            let happiness = (newHappiness-result.data.data.addictions[0].withdrawlhappiness);
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
                        reason:"nicotinewithdrawal",
                        value:happiness.toString()
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(()=>{
                Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are feeling nicotine withdrawal.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            });
        });
    }else{
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
                    reason:"nicotinewithdrawal",
                    value:""
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        });
    }
}

module.exports = {nicotineWithdrawl}