const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json');
module.exports = {
    desc: "A players profile",
    aliases: ['pro', 'pf','stats'],
    usage: "[@user]",
    cooldown: 10,
    guildOnly: true,
    task(Ai, msg, suffix){
    /**
     * perm checks
     * @param {boolean} sendMessages
     * @param {boolean} embedLinks
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    const embedLinks = msg.channel.permissionsOf(Ai.user.id).has('embedLinks');
    if (sendMessages === false) return;
    if (embedLinks === false) return msg.channel.createMessage(`\\❌ I'm missing the \`embedLinks\` permission, which is required for this command to work.`)
      .catch(err => {
        handleError(Ai, __filename, msg.channel, err);
      });
      if(!suffix){
        axios({
            url:config.APIurl,
            method:'post',
            data:{
                query:`
                query($discordID:String){
                    users(discordId:$discordID){
                      name
                      money
                      happiness
                      sleep
                      hunger
                      jobinfo{
                        name
                        income
                      }
                      medicalDegree
                      engineeringDegree
                      ROTCDegree
                      culinaryDegree
                      currentSchool
                      schoolDays
                    }
                  }
                `,
                variables:{
                    discordID:msg.author.id
                },
                headers:{
                    'Content-Type':'application/json'
                },
            }
        }).then(result=>{
            let users = result.data.data.users;
            let jobinfo = "Unemployed"
            if(users[0].job != "" ||users[0].job != null)jobinfo = users[0].jobinfo[0].name;
            Ai.createMessage(msg.channel.id,{
                content: ``,
                embed: {
                    color: Number(config.embedColor),
                    author: {
                      name: `${msg.author.username}`,
                      icon_url: ``
                    },
                    thumbnail:{
                        url:`https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}`
                    },
                    description: `**${jobinfo}**`,
                    fields:[
                        {
                            name:"Money",
                            value:users[0].money,
                            inline:true
                        },
                        {
                            name:"Happiness",
                            value:users[0].happiness,
                            inline:true
                        },
                        {
                            name:"Sleep",
                            value:users[0].sleep,
                            inline:true
                        },
                        {
                          name:"Hunger",
                          value:users[0].hunger,
                          inline:true
                      },
                    ]
                  }
            });
        });
      }
    }
}