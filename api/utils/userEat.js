const {Users,UserInventories} = require('./models');
let config = require('../json/config.json');

exports.userEat = (auth,discordId,hunger,happiness,sleep,item,itemsleft)=>{
    userEat(auth,discordId,hunger,happiness,sleep,item,itemsleft);
}
function userEat(auth,discordId,hunger,happiness,sleep,item,itemsleft){
    if(auth === config.APIAuth){
        console.log(sleep)
        Users.findOneAndUpdate({discordId:discordId},{hunger:hunger,happiness:happiness,sleep:sleep},{new:true},(err,data)=>{
            if(err)console.log(err);else console.log(data)
        });
        if(item == "Groceries"){
            UserInventories.findOneAndUpdate({discordId:discordId},{groceries:itemsleft},{new:true},(err,data)=>{
                if(err)console.log(err);else console.log(data)
            });
        }else if(item == "Fast_Food"){
            UserInventories.findOneAndUpdate({discordId:discordId},{fastfood:itemsleft},{new:true},(err,data)=>{
                if(err)console.log(err);else console.log(data)
            });
        }
    }
}