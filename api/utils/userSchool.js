const {Users,UserInventories} = require('./models');
let config = require('../json/config.json'),
    moment = require('moment');

exports.userSchool = (auth,discordId,hunger,happiness,sleep,nextbill,schoolDays)=>{
    userSchool(auth,discordId,hunger,happiness,sleep,nextbill,schoolDays);
}
function userSchool(auth,discordId,hunger,happiness,sleep,nextbill,schoolDays){
    if(auth === config.APIAuth){
        lastschool = moment().unix();
        Users.findOneAndUpdate({discordId:discordId},{happiness:happiness,sleep:sleep,hunger:hunger,nextbill:nextbill,lastSchool:lastschool,schoolDays:schoolDays},{new:true},(err,data)=>{
            if(err)console.log(err);
        }); 
    }
}