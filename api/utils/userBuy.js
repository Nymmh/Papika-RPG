const {Users,UserInventories,Items} = require('./models');
let config = require('../json/config.json');

exports.userBuy = (auth,discordId,money,happiness,item,amount)=>{
    userBuy(auth,discordId,money,happiness,item,amount);
}
function userBuy(auth,discordId,money,happiness,item,amount){
    if(auth === config.APIAuth){
        Users.findOneAndUpdate({discordId:discordId},{money:money,happiness:happiness},{new:true},(err,data)=>{
            if(err)console.log(err);
        });
        if(item === "Groceries"){
            UserInventories.findOneAndUpdate({discordId:discordId},{groceries:amount},{new:true},(err,data)=>{
                if(err)console.log(err);else console.log(data)
            });
        }else if(item === "Fast_Food"){
            UserInventories.findOneAndUpdate({discordId:discordId},{fastfood:amount},{new:true},(err,data)=>{
                if(err)console.log(err);else console.log(data)
            });
        }else if(item.match(/(Bed_Tier_)/)){
            Items.findOne({name:item},(err,res)=>{
                itemId = res._id;
                UserInventories.findOneAndUpdate({discordId:discordId},{bed:itemId},{new:true},(err,data)=>{
                    if(err)console.log(err);else console.log(data)
                });
            });
        }
    }
}