var reload = require('require-reload'),
    _Logger = reload('../util/logger.js'),
    logger;
module.exports = (Ai, _settingsManager, _config, guild)=>{
    if(logger === undefined)logger = new _Logger(_config.logTimeStamp);
    logger.logWithHeader('LEFT GUILD', 'bgGreen', 'black', `${guild.name} ${guild.id} owned by ${guild.members.get(guild.ownerID)}`);
    guild.leave();
    return;
}