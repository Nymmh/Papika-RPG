const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils'),
      findMember = require('../../util/utils.js').findMember;
module.exports = {
    desc: "Check your invites",
    aliases: ['in'],
    usage: "[clear/accept/decline/delete/list] <inviteid>",
    cooldown: 5,
    guildOnly: false,
    task(Ai, msg, suffix){
        var options = '';
        if(suffix) options = suffix.split(" ");
        if(options == '' || options[0] == 'list'){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gangInvites
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
                let gangInvites = result.data.data.users[0].gangInvites;
                if(gangInvites == null || gangInvites == '')return msg.author.getDMChannel().then(dmch=>{dmch.createMessage(`You have no pending invites.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                let invites = gangInvites.split(','),
                    invitemsg = '';
                console.log(invites)
                for(let i = 0;i<invites.length;i++){
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            query($id:String){
                                gangs(id:$id){
                                  name
                                }
                              }
                            `,
                            variables:{
                                id:invites[i]
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }

                    }).then(result=>{
                        invitemsg += `${result.data.data.gangs[0].name} >> ${invites[i]}\n`;
                        if(i==(invites.length-1))return msg.author.getDMChannel().then(dmch=>{dmch.createMessage("```"+invitemsg+"```").catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    });
                }
            });
        } else if(options[0] == 'decline' || options[0] == 'delete'){
            if(!options[1]) return 'wrong usage';
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gangInvites
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
                let gangInvites = result.data.data.users[0].gangInvites;
                if(gangInvites == null || gangInvites == '')return msg.author.getDMChannel().then(dmch=>{dmch.createMessage(`You have no pending invites.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                let invites = gangInvites.split(','),
                    removegang = '';
                for(let inv in invites){
                    if(options[1] == invites[inv])removegang = invites[inv]
                }
                if(removegang == '')return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, I could not find an invite with that id.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        mutation($auth:String,$discordId:String,$reason:String,$gangid:String){
                            sendGangInvite(auth:$auth,discordId:$discordId,reason:$reason,gangid:$gangid){
                              name
                            }
                          }
                        `,
                        variables:{
                            auth:config.APIAuth,
                            discordId:msg.author.id,
                            reason:"decline",
                            gangid:removegang
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, declined that invite.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                });
            });
        } else if(options[0] == 'clear'){
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gangInvites
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
                let gangInvites = result.data.data.users[0].gangInvites;
                if(gangInvites == null || gangInvites == '')return msg.author.getDMChannel().then(dmch=>{dmch.createMessage(`You have no pending invites.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
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
                            reason:"clear"
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(()=>{
                    return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you cleared all your invites.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                });
            });
        }else if(options[0] == 'accept'){
            if (msg.channel.guild === undefined) // guildOnly check
                return msg.channel.createMessage('This command can only be used in a server.');
            if(!options[1]) return 'wrong usage';
            axios({
                url:config.APIurl,
                method:'post',
                data:{
                    query:`
                    query($discordId:String){
                        users(discordId:$discordId){
                            gangInvites
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
                let gangInvites = result.data.data.users[0].gangInvites;
                if(gangInvites == null || gangInvites == '')return msg.author.getDMChannel().then(dmch=>{dmch.createMessage(`You have no pending invites.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                let invites = gangInvites.split(','),
                    findgang = '';
                for(let inv in invites){
                    if(options[1] == invites[inv])findgang = invites[inv]
                }
                if(findgang == '')return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, I could not find an invite with that id.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                axios({
                    url:config.APIurl,
                    method:'post',
                    data:{
                        query:`
                        query($id:String){
                            gangs(id:$id){
                                invites
                                name
                                leader
                            }
                          }
                        `,
                        variables:{
                            id:options[1]
                        },
                        headers:{
                            'Content-Type':'application/json'
                        },
                    }
                }).then(result=>{
                    if(result.data.data.gangs == null)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, I could not find a gang for that invite.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    const leader = result.data.data.gangs[0].leader,
                          gangname = result.data.data.gangs[0].name;
                    axios({
                        url:config.APIurl,
                        method:'post',
                        data:{
                            query:`
                            mutation($auth:String,$discordId:String,$reason:String,$gangid:String){
                                sendGangInvite(auth:$auth,discordId:$discordId,reason:$reason,gangid:$gangid){
                                  name
                                }
                              }
                            `,
                            variables:{
                                auth:config.APIAuth,
                                discordId:msg.author.id,
                                reason:"accept",
                                gangid:options[1]
                            },
                            headers:{
                                'Content-Type':'application/json'
                            },
                        }
                    }).then(()=>{
                        function joingang(value, keys, map){
                            if(value.name == gangname)msg.guild.addMemberRole(msg.author.id,value.id,'Joined Gang');
                        }
                        new Map(msg.guild.roles).forEach(joingang)
                        msg.guild.addMemberRole(msg.author.id,'829465655740334100','Added Gangs role');
                        const gangleader = findMember(msg, leader);
                        gangleader.getDMChannel().then(dmch=>{dmch.createMessage(`**${msg.author.username}#${msg.author.discriminator}** joined your gang.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});}).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you joined the gang ${gangname}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
                    });
                });
            });
        }
    }
}