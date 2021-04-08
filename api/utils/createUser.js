const {Users,UserInventories} = require('./models');
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
                    let newUsersInv = new UserInventories({discordId:discordId,bed:"60644135aa88ed348b1d5764"});
                    newUsersInv.save().then(()=>{
                        console.log("new user created")
                    });
                });
            }
        });
    }
}