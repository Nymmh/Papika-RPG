const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils'),
      findMember = require('../../util/utils.js').findMember;
module.exports = {
    desc: "Gang shit",
    aliases: ['g'],
    usage: "<info/create/edit/invite/leave> [icon/@user] [iconurl]",
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg, suffix){
        let options = suffix.split(" ");
        if(options[0] == "create"){
            if(!options[1])return 'wrong usage';
            options.shift();
            var gangname = "";
            for(let op in options){
                gangname += options[op]+" ";
            }
            if(gangname == "")return 'wrong usage';
            if(gangname.length > 25)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, your gang name cant be longer then 25 characters.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gang
                        }
                      }
                    `,
                    variables:{
                        discordId:msg.author.id
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                if(result.data.data.users[0].gang !== null && result.data.data.users[0].gang !== undefined && result.data.data.users[0].gang !== "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are already in a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        query($name:String){
                            gangs(name:$name){
                              name
                            }
                          }
                        `,
                        variables:{
                            name:gangname
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(result=>{
                    if(result.data.data.gangs[0] !== undefined)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, a gang with the name ${gangname} already exists.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth:String,$discordId:String,$name:String,$reason:String){
                                createGang(auth:$auth,discordId:$discordId,name:$name,reason:$reason){
                                  name
                                }
                              }
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                name:gangname,
                                reason:"create"
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{
                        msg.guild.createRole({name:gangname,mentionable:false,hoist:false}).then(res=>{
                            msg.guild.addMemberRole(msg.author.id,res.id,'Guild Creation');
                            msg.guild.addMemberRole(msg.author.id,'829465655740334100','Added Gangs role');
                        });
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you created a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    })
                });
            });
        }else if(options[0] == "info" || !options[0]){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gang
                            ganginfo{
                                name
                                members
                                funds
                                icon
                                crimes
                                leader
                                color
                            }
                        }
                      }
                    `,
                    variables:{
                        discordId:msg.author.id
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                if(result.data.data.users[0].gang == undefined || result.data.data.users[0].gang == "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are not in a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                let ganginfo = result.data.data.users[0].ganginfo[0];
                let gangcolor = ganginfo.color || '#89c2b6';
                const user = findMember(msg, ganginfo.leader);
                return Ai.createMessage(msg.channel.id,{
                    content: ``,
                    embed: {
                        color: Number(gangcolor),
                        author: {
                          name: `${ganginfo.name}`,
                          icon_url: ``
                        },
                        thumbnail:{
                            url:`${ganginfo.icon}`
                        },
                        description: ``,
                        fields:[
                            {
                                name:"Leader",
                                value:user.username+"#"+user.discriminator,
                                inline:true
                            },
                            {
                                name:"Members",
                                value:ganginfo.members,
                                inline:true
                            },
                            {
                                name:"Funds",
                                value:ganginfo.funds,
                                inline:true
                            },
                            {
                              name:"Crimes",
                              value:ganginfo.crimes,
                              inline:true
                          },
                        ]
                      }
                });
            });
        }else if(options[0] == "edit"){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gang
                            ganginfo{
                                name
                                members
                                funds
                                icon
                                crimes
                                leader
                                color
                            }
                        }
                      }
                    `,
                    variables:{
                        discordId:msg.author.id
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                if(result.data.data.users[0].gang == undefined || result.data.data.users[0].gang == "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are not in a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                if(result.data.data.users[0].ganginfo[0].leader != msg.author.id)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are not the leader of your gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                if(!options[1]) return 'wrong usage';
                if(!options[2]) return 'wrong usage';
                if(options[1] == 'icon'){
                    if(options[2].match(/(.gif)/))return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you can't use a gif for a gang icon.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth:String,$discordId:String,$name:String,$reason:String){
                                createGang(auth:$auth,discordId:$discordId,name:$name,reason:$reason){
                                  name
                                }
                              }
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                name:options[2],
                                reason:"editicon"
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you edited your gang icon.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    });
                }
            })
        }else if(options[0] == "invite"){
            if(!options[1]) return 'wrong usage';
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gang
                            ganginfo{
                                name
                                members
                                funds
                                icon
                                crimes
                                leader
                                color
                            }
                        }
                      }
                    `,
                    variables:{
                        discordId:msg.author.id
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                if(result.data.data.users[0].gang == undefined || result.data.data.users[0].gang == "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are not in a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                if(result.data.data.users[0].ganginfo[0].leader != msg.author.id)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are not the leader of your gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                const user = findMember(msg, options[1]);
                if(!user) return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, ${options[1]} is not a valid guild member.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                if(user.bot)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you can not invite bots to a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        query($discordId:String){
                            users(discordId:$discordId){
                                gang
                                ganginfo{
                                    name
                                    invites
                                }
                            }
                          }
                        `,
                        variables:{
                            discordId:msg.author.id
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(result=>{
                    let invites = result.data.data.users[0].ganginfo[0].invites,
                        gangname = result.data.data.users[0].ganginfo[0].name;
                    let ganginvites = invites.split(",");
                    for(let gi in ganginvites){
                        if(ganginvites[gi] == user.id)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, that user is already invited to the gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    }
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth:String,$discordId:String,$reason:String,$gangid:String,$userid:String){
                                sendGangInvite(auth:$auth,discordId:$discordId,reason:$reason,gangid:$gangid,userid:$userid){
                                  name
                                }
                              }
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                reason:"invite",
                                gangid:result.data.data.users[0].gang,
                                userid:user.id
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{
                        user.getDMChannel().then(dmch=>{dmch.createMessage(`You have been invited to the gang **${gangname}** by __${msg.author.username}#${msg.author.discriminator}__`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you invited ${user.username}#${user.discriminator} to the gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    });
                });
            });
        } else if(options[0] == 'leave'){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gang
                            ganginfo{
                                leader
                                name
                            }
                        }
                      }
                    `,
                    variables:{
                        discordId:msg.author.id
                    },
                    headers:{
                        'Content-Type':'application/json'
                    },
                }
            }).then(result=>{
                const leader = result.data.data.users[0].ganginfo[0].leader,
                      gangname = result.data.data.users[0].ganginfo[0].name;
                if(result.data.data.users[0].gang == undefined || result.data.data.users[0].gang == "")return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are not in a gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                if(leader == msg.author.id)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are the leader of your gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        mutation($auth:String,$discordId:String,$reason:String){
                            sendGangInvite(auth:$auth,discordId:$discordId,reason:$reason){
                              name
                            }
                          }
                        `,
                        variables:{
                            auth:config.APIAuth,
                            discordId:msg.author.id,
                            reason:"leave"
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    function leavegang(value, keys, map){
                        if(value.name == gangname)msg.guild.removeMemberRole(msg.author.id,value.id,'Left Gang');
                    }
                    new Map(msg.guild.roles).forEach(leavegang)
                    msg.guild.removeMemberRole(msg.author.id,'829465655740334100','Removed Gangs role');
                    const gangleader = findMember(msg, leader);
                    gangleader.getDMChannel().then(dmch=>{dmch.createMessage(`**${msg.author.username}#${msg.author.discriminator}** left your gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you left the gang ${gangname}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                })
            });
        }
    }
}