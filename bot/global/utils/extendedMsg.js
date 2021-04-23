let axios = require('axios'),
    config = require('../../json/config.json');

function extendedMsg(Ai,msg,newSleep,newHunger,newHappiness){
    Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, your current sleep is **${newSleep}**, your current hunger is **${newHunger}** and your current happiness is **${newHappiness}**`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
}
module.exports = {extendedMsg};