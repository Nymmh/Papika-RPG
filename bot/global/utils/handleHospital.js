const {getRandomInt} = require('../../util/utils');
let axios = require('axios'),
    config = require('../../json/config.json');
function handleHospital(Ai,msg,newmoney){
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($discordId:String){
                users(discordId:$discordId){
                    money
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
        let money = result.data.data.users[0].money;
        let hospitalBill = getRandomInt(100,350);
        let hospitalBillMone = (money-hospitalBill)
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
                    reason:"hospitalbills",
                    value:hospitalBillMone.toString()
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(()=>{
            logger.green(`User Change for ${msg.author.id} >> ${msg.author.username}`);
            Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, your hospital bills cost you ${hospitalBill}${config.moneyname}'s`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        });
    })
}
module.exports = {handleHospital};