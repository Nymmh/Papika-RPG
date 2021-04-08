const {Users,UserInventories,Items,UserHouseInventory} = require('./models');
let config = require('../json/config.json');

exports.userStash = (auth,discordId,item,amount,reason)=>{
    userStash(auth,discordId,item,amount,reason);
}
function userStash(auth,discordId,item,amount,reason){
    if(auth === config.APIAuth){
        if(reason == 'store'){
            UserInventories.findOne({discordId:discordId},(err,res)=>{
                let usedspace = (res.usedSpace-amount),
                    groceries = (res.groceries-amount),
                    fastfood = (res.fastfood-amount);
                UserHouseInventory.findOne({discordId:discordId},(err,res)=>{
                    let houseUsedSpace = (res.usedSpace+amount),
                        housegroceries = 0,
                        housefastfood = 0;
                    if(res.groceries)housegroceries = res.groceries;
                    if(res.fastfood)housefastfood = res.fastfood;
                    housegroceries = (housegroceries+amount);
                    housefastfood = (housegroceries+amount);
                    UserInventories.findOneAndUpdate({discordId:discordId},{usedSpace:usedspace},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                    UserHouseInventory.findOneAndUpdate({discordId:discordId},{usedSpace:houseUsedSpace},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                    if(item === "Groceries"){
                        UserInventories.findOneAndUpdate({discordId:discordId},{groceries:groceries},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                        UserHouseInventory.findOneAndUpdate({discordId:discordId},{groceries:housegroceries},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }else if(item === "Fast_Food"){
                        UserInventories.findOneAndUpdate({discordId:discordId},{fastfood:fastfood},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                        UserHouseInventory.findOneAndUpdate({discordId:discordId},{fastfood:housefastfood},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                });
            });
        }else if(reason == 'take'){
            UserInventories.findOne({discordId:discordId},(err,res)=>{
                let usedspace = (res.usedSpace+amount),
                    groceries = (res.groceries+amount),
                    fastfood = (res.fastfood+amount);
                UserHouseInventory.findOne({discordId:discordId},(err,res)=>{
                    let houseUsedSpace = (res.usedSpace-amount),
                        housegroceries = 0,
                        housefastfood = 0;
                    if(res.groceries)housegroceries = res.groceries;
                    if(res.fastfood)housefastfood = res.fastfood;
                    housegroceries = (housegroceries-amount);
                    housefastfood = (housegroceries-amount);
                    UserInventories.findOneAndUpdate({discordId:discordId},{usedSpace:usedspace},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                    UserHouseInventory.findOneAndUpdate({discordId:discordId},{usedSpace:houseUsedSpace},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                    if(item === "Groceries"){
                        UserInventories.findOneAndUpdate({discordId:discordId},{groceries:groceries},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                        UserHouseInventory.findOneAndUpdate({discordId:discordId},{groceries:housegroceries},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }else if(item === "Fast_Food"){
                        UserInventories.findOneAndUpdate({discordId:discordId},{fastfood:fastfood},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                        UserHouseInventory.findOneAndUpdate({discordId:discordId},{fastfood:housefastfood},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                });
            });
        }
    }
}