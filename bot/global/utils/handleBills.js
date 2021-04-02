const {getRandomInt} = require('../../util/utils');
let axios = require('axios'),
    config = require('../../json/config.json');
function handleBills(Ai,msg,newmoney){
    let billTotal = 0;
    let utilityBill = getRandomInt(100,150);
    billTotal = (billTotal+utilityBill);
    let billmoney = (newmoney-billTotal);
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
                reason:"bills",
                value:billmoney.toString()
            },
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(()=>{
        logger.green(`User Change for ${msg.author.id} >> ${msg.author.username}`);
        Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, your bills cost you ${billTotal}${config.moneyname}'s`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    });
}
module.exports = {handleBills};