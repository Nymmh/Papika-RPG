const {Users,UserInventories,UserHouseInventory} = require('./models');
let config = require('../json/config.json');

exports.createUser = (auth,discordId,name,avatar)=>{
    createUser(auth,discordId,name,avatar);
}
function createUser(auth,discordId,name,avatar){
    if(auth === config.APIAuth){
        Users.find({discordId:discordId},(err,res)=>{
            if(!err) if(!res[0]){
                console.log("creating user");
                let newUser = new Users({discordId:discordId,name:name,avatar:`https://cdn.discordapp.com/avatars/${discordId}/${avatar}`,money:10,happiness:100,sleep:100,hunger:100,jobexp:0,nextbill:30});
                newUser.save().then(()=>{
                    let newUsersInv = new UserInventories({discordId:discordId,maxSpace:5,usedSpace:0,backpack:false});
                    newUsersInv.save().then(()=>{
                        let newHouseInv = new UserHouseInventory({discordId:discordId,bed:"60644135aa88ed348b1d5764",maxSpace:15,usedSpace:0,storageUpgrade:0,security:0,house:"606fc005623119dad350cf68"});
                        newHouseInv.save().then(()=>{
                            console.log("new user created")
                        })
                    });
                });
            }
        });
    }
}