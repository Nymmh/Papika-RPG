const {Users,Gangs} = require('./models');
let config = require('../json/config.json');

exports.createGang = (auth,discordId,name,reason)=>{
    createGang(auth,discordId,name,reason);
}
exports.sendGangInvite = (auth,discordId,reason,gangid,userid)=>{
    sendGangInvite(auth,discordId,reason,gangid,userid);
}
function createGang(auth,discordId,name,reason){
    if(auth === config.APIAuth){
        if(reason == 'create'){
            let newGang = new Gangs({name:name.trim(),leader:discordId,members:1,funds:0,icon:"",crimes:0,invites:""});
            newGang.save().then(res=>{
                Users.findOneAndUpdate({discordId:discordId},{gang:res._id},{new:true},()=>{});
            });
        } else if(reason == 'editicon'){
            Users.findOne({discordId:discordId},(err,res)=>{
                Gangs.findOneAndUpdate({_id:res.gang},{icon:name},{new:true},()=>{});
            });
        }
    }
}

function sendGangInvite(auth,discordId,reason,gangid,userid){
    if(auth === config.APIAuth){
        if(reason == 'invite'){
            Gangs.findOne({_id:gangid},(err,res)=>{
                let invites = res.invites;
                if(invites == '')invites = userid.toString();
                else invites += ","+userid.toString();
                Gangs.findOneAndUpdate({_id:gangid},{invites:invites},{new:true},(err,res)=>{});
                Users.findOne({discordId:userid},(err,res)=>{
                    let playerinvites = res.ganginvites;
                    if(playerinvites == undefined || playerinvites == '')playerinvites = gangid.toString();
                    else playerinvites += ","+gangid.toString();
                    Users.findOneAndUpdate({discordId:userid},{gangInvites:playerinvites},{new:true},(err,res)=>{});
                });
            });
        } else if(reason == 'decline'){
            Users.findOne({discordId:discordId},(err,res)=>{
                let invites = res.gangInvites.split(",")
                for(let inv in invites){
                    if(invites[inv] == gangid)delete invites[inv]
                }
                Users.findOneAndUpdate({discordId:discordId},{gangInvites:invites.toString()},{new:true},(err,res)=>{})
                Gangs.findOne({_id:res.gangInvites},(err,res)=>{
                    let ganginvites = res.invites.split(",");
                    for(let inv in ganginvites){
                        if(ganginvites[inv] == discordId)delete ganginvites[inv];
                    }
                    Gangs.findOneAndUpdate({_id:res._id},{invites:ganginvites.toString()},{new:true},(err,res)=>{})
                });
            });
        }else if(reason == 'clear'){
            Users.findOne({discordId:discordId},(err,res)=>{
                let invites = res.gangInvites.split(",")
                for(let inv in invites){
                    Gangs.findOne({_id:invites[inv]},(err,res)=>{
                        let ganginvites = res.invites.split(",");
                        for(let inv in ganginvites){
                            if(ganginvites[inv] == discordId)delete ganginvites[inv];
                            Gangs.findOneAndUpdate({_id:res._id},{invites:ganginvites.toString()},{new:true},(err,res)=>{})
                        }
                    });
                }
                Users.findOneAndUpdate({discordId:discordId},{gangInvites:''},{new:true},(err,res)=>{})
            });
        }else if(reason == 'accept'){
            Users.findOne({discordId:discordId},(err,res)=>{
                let invites = res.gangInvites.split(",")
                for(let inv in invites){
                    if(invites[inv] == gangid)delete invites[inv]
                }
                Users.findOneAndUpdate({discordId:discordId},{gangInvites:invites.toString(),gang:gangid},{new:true},(err,res)=>{})
                Gangs.findOne({_id:res.gangInvites},(err,res)=>{
                    let ganginvites = res.invites.split(",");
                    for(let inv in ganginvites){
                        if(ganginvites[inv] == discordId)delete ganginvites[inv];
                    }
                    Gangs.findOneAndUpdate({_id:res._id},{invites:ganginvites.toString(),members:res.members+1},{new:true},(err,res)=>{})
                });
            });
        }else if(reason == 'leave'){
            Users.findOne({discordId:discordId},(err,res)=>{
                Gangs.findOne({_id:res.gang},(err,res)=>{
                    Gangs.findOneAndUpdate({_id:res._id},{members:res.members-1},{new:true},(err,res)=>{})
                });
                Users.findOneAndUpdate({discordId:discordId},{gang:''},{new:true},(err,res)=>{})
            });
        }
    }
}