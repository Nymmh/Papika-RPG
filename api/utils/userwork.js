const {Users} = require('./models');
let config = require('../json/config.json'),
    moment = require('moment');

exports.userWork = (auth,discordId,money,happiness,sleep,hunger,jobexp,nextbill,lastwork)=>{
    userWork(auth,discordId,money,happiness,sleep,hunger,jobexp,nextbill,lastwork);
}
function userWork(auth,discordId,money,happiness,sleep,hunger,jobexp,nextbill,lastwork){
    if(auth === config.APIAuth){
        lastwork = moment().unix();
        Users.findOneAndUpdate({discordId:discordId},{money:money,happiness:happiness,sleep:sleep,hunger:hunger,jobexp:jobexp,nextbill:nextbill,lastwork},{new:true},(err,data)=>{
            if(err)console.log(err);
        }); 
    }
}