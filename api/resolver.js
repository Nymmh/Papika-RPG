const {Users,Cooldowns,Items,Jobs} = require('./utils/models');

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
    }
}