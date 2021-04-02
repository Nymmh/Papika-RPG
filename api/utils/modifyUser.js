const {Users} = require('./models');
let config = require('../json/config.json');

exports.modifyUser = (auth,discordId,reason,value)=>{
    modifyUser(auth,discordId,reason,value);
}
function modifyUser(auth,discordId,reason,value){
    if(auth === config.APIAuth){
        if(reason == "jobchange"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{job:value,jobexp:0},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }else if(reason == "bills"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{money:Number(value),nextbill:30},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
    }
}