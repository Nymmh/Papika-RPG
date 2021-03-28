var reload = require('require-reload')(require),
    config = reload('../json/config.json'),
    error,
    logger,
    logger = new(reload('../util/logger.js'))(config.logTimestamp);

const fs = require('fs');
module.exports ={
    handler(Ai, msg, CommandManagers, config, settingsManager){
        if(msg.author.bot === true)return;
        if(msg.channel.guild === undefined)return;
        if(msg.guild.id !== "825622245102714910")return;
        for(let i=0; i<CommandManagers.length;i++){
            if((msg.content.startsWith(CommandManagers[i].prefix))&& (!msg.channel.guild))return msg.channel.createMessage('Command can only be used in guild').catch(err=>{
                if(!err.response)return logger.error('\n' + err, 'ERROR');
                error = JSON.parse(err.response);
                if((!error.code)&&(!error.message))return logger.error('\n' + err, 'ERROR');
                logger.error(error.code + '\n' + error.message, 'ERROR');
            });
            if(msg.content.startsWith(CommandManagers[i].prefix))
                return CommandManagers[i].processCommand(Ai, msg, config, settingsManager);
        }
    }
}