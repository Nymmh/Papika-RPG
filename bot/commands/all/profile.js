const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json');
module.exports = {
    desc: "A players profile",
    aliases: ['pro', 'pf','stats'],
    cooldown: 10,
    guildOnly: false,
    task(Ai, msg){
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
                      job
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
            if(users[0].job != "" && users[0].job != null && users[0].job != undefined)jobinfo = users[0].jobinfo[0].name;
            return Ai.createMessage(msg.channel.id,{
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