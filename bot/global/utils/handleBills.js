const {getRandomInt} = require('../../util/utils');
let axios = require('axios'),
    config = require('../../json/config.json');
function handleBills(Ai,msg,newmoney){
    let billTotal = 0;
    let utilityBill = getRandomInt(100,150);
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($discordId:String){
                users(discordId:$discordId){
                    houseInventory{
                    house{
                        rentCost
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
        let rent = 0;
        rent = result.data.data.users[0].houseInventory[0].house[0].rentCost;
        billTotal = (billTotal+utilityBill+rent);
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
    });
}
module.exports = {handleBills};