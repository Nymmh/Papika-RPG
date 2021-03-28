var reload = require('require-reload'),
    _Logger = reload('./logger.js'),
    logger;

module.exports = function(config){
    if(logger === undefined)
        logger = new _Logger(config.logTimestamp);
    return new Promise((resolve, reject) => {
        if(!config.token){
            logger.error('Missing token');
        return reject();
        }
        if(typeof config.shardCount !== 'number' || config.shardCount < 1){
            logger.error('shardCount needs to be a positive number');
        return reject();
        }
        if(typeof config.disableEvents !== 'object'){
            logger.error('disableEvents has to be true or false');
        return reject();
        }
        if(!Array.isArray(config.bannedGuildsIds)){
            logger.error('bannedGuildsIds must be a string');
        return reject();
        }
        //Invalid commands
        for(let prefix in config.commandSets){
            if(prefix === ""){
                logger.error('A commandSet has no prefix');
            return reject();
            }else if(!config.commandSets[prefix].hasOwnProperty('dir')){
                logger.error('Must define a dir commandSet ' + prefix);
            return reject();
            }
        }
        if(!config.adminIds || config.adminIds.length < 1){
            logger.error('You must define an Admin id');
        return reject();
        }else if(typeof config.adminIds[0] !== 'string' || config.adminIds[0] === ""){
            logger.error('Admin id must be a string');
        return reject();
        }
        if(typeof config.reloadCommand !== 'string' || config.reloadCommand === "0"){
            logger.error('The reloadCommand must be a string');
        return reject();
        }
        if(!config.inviteLink)
            logger.warn('Invite link is not defined');
        if(typeof config.logTimestamp !== 'boolean')
            logger.warn('logTimestamp must be true or false');
        if(typeof config.cycleGames !== 'boolean')
            logger.warn('cycleGames must be true of false');
        return resolve();
    });
};