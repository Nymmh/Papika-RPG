const {Users,UserInventories,UserHouseInventory} = require('./models');
let config = require('../json/config.json');

exports.purgeServer = (auth)=>{
    purgeServer(auth);
}
function purgeServer(auth){
    if(auth === config.APIAuth){
        Users.deleteMany({},(err,res)=>{
            console.log(err)
        });
        UserInventories.deleteMany({},(err,res)=>{
            console.log(err)
        });
        UserHouseInventory.deleteMany({},(err,res)=>{
            console.log(err)
        });
    }
}