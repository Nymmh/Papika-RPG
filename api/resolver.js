const {Users,Cooldowns,Items,Jobs,ItemValues,UserInventories} = require('./utils/models');
const {createUser} = require('./utils/createUser'),
      {modifyUser} = require('./utils/modifyUser'),
      {userWork} = require('./utils/userwork'),
      {userSleep} = require('./utils/userSleep');

module.exports = {
    Query:{
        users(parent, args, context, info){
            if(args){
                if(args.discordId) return Users.find({discordId:args.discordId});
                else return Users.find();
            }
        },
        cooldowns(parent, args, context, info){
            if(args){
                if(args.work) return Cooldowns.find({name:args.work});
                else return Cooldowns.find();
            }
        },
        items(parent, args, context, info){
            if(args){
                if(args.name) return Items.find({name:args.name});
                else if(args.group) return Items.find({group:args.group});
                else return Items.find();
            }
        },
        jobs(parent, args, context, info){
            if(args){
                if(args.name) return Jobs.find({name:args.name});
                else if(args.group) return Jobs.find({group:args.group});
                else if(args.rank) return Jobs.find({rank:args.rank});
                else return Jobs.find();
            }
        }
    },
    Mutation:{
        createUser: async(_,{auth,discordId,name,avatar})=>{createUser(auth,discordId,name,avatar)},
        modifyUser: async(_,{auth,discordId,reason,value})=>{modifyUser(auth,discordId,reason,value)},
        UserWork: async(_,{auth,discordId,money,happiness,sleep,hunger,jobexp,nextbill,lastwork})=>{userWork(auth,discordId,money,happiness,sleep,hunger,jobexp,nextbill,lastwork)},
        UserSleep: async(_,{auth,discordId,sleep,happiness,hunger,reason})=>{userSleep(auth,discordId,sleep,happiness,hunger,reason)}
    },
    Items:{
        async values(parent,args, context, info){
            return ItemValues.find({parent:parent._id});
        }
    },
    Profile:{
        async jobinfo(parent,args, context, info){
            return Jobs.find({_id:parent.job});
        },
        async inventory(parent,args, context, info){
            return UserInventories.find({discordId:parent.discordId})
        },
    },
    Inventory:{
        async bed(parent,args, context, info){
            return ItemValues.find({parent:parent.bed});
        }
    }
}