const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils');
module.exports = {
    desc: "Check the weather!",
    aliases: ['we'],
    cooldown: 20,
    guildOnly: true,
    task(Ai, msg){
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
       axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query{
                environments(type:Weather){
                  weatherType
                  cloudType
                  temperature
                  humidity
                  wind
                }
              }
            `,
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(result=>{
        let weather = result.data.data.environments[0];
        Ai.createMessage(msg.channel.id,{
            content: ``,
            embed: {
                color: Number(config.embedColor),
                author: {
                  name: `Weather Report`,
                  icon_url: ``
                },
                description: ``,
                fields:[
                    {
                        name:"Weather",
                        value:weather.weatherType,
                        inline:true
                    },
                    {
                        name:"Clouds",
                        value:weather.cloudType,
                        inline:true
                    },
                    {
                        name:"Temperature",
                        value:weather.temperature+"°C",
                        inline:true
                    },
                    {
                      name:"Humidity",
                      value:weather.humidity+"%",
                      inline:true
                    },
                    {
                        name:"Wind",
                        value:weather.wind+"kph",
                        inline:true
                    },
                ]
              }
        });
    });
    }
}