const {Users,UserInventories,Items,UserHouseInventory,ItemValues} = require('./models');
let config = require('../json/config.json');

exports.userBuy = (auth,discordId,money,happiness,item,amount)=>{
    userBuy(auth,discordId,money,happiness,item,amount);
}
function userBuy(auth,discordId,money,happiness,item,amount){
    if(auth === config.APIAuth){
        UserInventories.findOne({discordId:discordId},(err,res)=>{
            let usedspace = (res.usedSpace+amount);
            UserInventories.findOneAndUpdate({discordId:discordId},{usedSpace:usedspace},{new:true},(err,data)=>{
                if(err)console.log(err);else console.log(data)
            });
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
                    UserHouseInventory.findOneAndUpdate({discordId:discordId},{bed:itemId},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                });
            }else if(item.match(/(House_Tier_)/)){
                Items.findOne({name:item},(err,res)=>{
                    itemId = res._id;
                    ItemValues.findOne({parent:itemId},(err,res)=>{
                        let storage = res.storage;
                        UserHouseInventory.findOne({discordId:discordId},(err,res)=>{
                            let storageUpgrades = res.storageUpgrade;
                            if(storageUpgrades = 0)storage = storage;
                            UserHouseInventory.findOneAndUpdate({discordId:discordId},{house:itemId,maxSpace:storage},{new:true},(err,data)=>{
                                if(err)console.log(err);else console.log(data)
                            });
                        });
                    });
                });
            }else if(item === "Backpack"){
                UserInventories.findOneAndUpdate({discordId:discordId},{maxSpace:20,backpack:true},{new:true},(err,data)=>{
                    if(err)console.log(err);else console.log(data)
                });
            }else if(item === "Peko_Vape_Mod"){
                usedspace = (res.usedSpace+1);
                Items.findOne({name:item},(err,res)=>{
                    itemId = res._id;
                    UserInventories.findOneAndUpdate({discordId:discordId},{usedSpace:usedspace,vape:itemId},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                });
            }else if(item.match(/(Yubi_Juice_)/)){
                usedspace = (res.usedSpace+1);
                Items.findOne({name:item},(err,res)=>{
                    itemId = res._id;
                    let strengthSearch = `nic${amount}`;
                    Items.findOne({name:strengthSearch},(err,res)=>{
                        strengthId = res._id
                        UserInventories.findOneAndUpdate({discordId:discordId},{money:money,usedSpace:usedspace,vapejuice:itemId,vapejuiceRemaining:100,vapejuiceStrength:strengthId},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    });
                });
            }
        });
    }
}