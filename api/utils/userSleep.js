const {Users} = require('./models');
let config = require('../json/config.json'),
    moment = require('moment');

exports.userSleep = (auth,discordId,sleep,happiness,hunger,reason)=>{
    userSleep(auth,discordId,sleep,happiness,hunger,reason);
}
function userSleep(auth,discordId,sleep,happiness,hunger,reason){
    if(auth === config.APIAuth){
        if(reason == "sleep"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user for sleep");
                    newlastsleep = moment().unix();
                    Users.findOneAndUpdate({discordId:discordId},{sleep:sleep,happiness:happiness,hunger:hunger,lastsleep:newlastsleep},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
    }
}