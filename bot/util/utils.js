var fs = require('fs'),
    reload = require('require-reload'),
    logger = new(reload('./logger.js'))((reload('../json/config.json')).logTimestamp),
    config = reload('../json/config.json');

/**
 * @module utils
 */

 /**
  * Save files
  * @arg {String} dir
  * @arg {String} ext
  * @arg {String} data
  * @arg {Number} minSize
  * @arg {Boolean} log
  * @returns {Promise<Boolean|Error>} Will return true if saved
  */

exports.safeSave = (file, ext, data, minSize = 5, log = true) =>{
    return new Promise((resolve, reject)=>{
        if(!file || !ext || !data)
            return reject(new Error('Invalid arg'));
        if(file.startsWith('/')) file = file.substr(1);
        if(!ext.startsWith('.')) ext = '.' + ext;

        fs.writeFile(`${__dirname}/../${file}-temp${ext}`, data, error =>{
            if(error){
                logger.error(error, 'WRITE');
                reject(error);
            }else{
                fs.stat(`${__dirname}/../${file}-temp${ext}`,(err, stats) =>{
                    if(err){
                        logger.error(err, 'STAT');
                        reject(err);
                    }else if(stats["size"] < minSize){
                        logger.debug('Stop file from being overwritten');
                        resolve(false);
                    }else{
                        fs.rename(`${__dirname}/../${file}-temp${ext}`, `${__dirname}/../${file}${ext}`, e =>{
                            if(e){
                                logger.error(e, 'RENAME');
                                reject(e);
                            }else resolve(true);
                        });
                        if(log === true)logger.debug(`Updated ${file}${ext}`, 'SAVED');
                    }
                });
            }
        });
    });
}

/**
 * Finds member matching string
 * @arg {String} query
 * @arg {Eris.Guild} guild the guild to look at // server
 * @arg {Boolean} [exact=false]
 * @returns {?Eris.Member}
 */
exports.findMember = (msg, str) => {
    if (!str || str === '') return false
    const guild = msg.channel.guild
    if (!guild) return msg.mentions[0] ? msg.mentions[0] : false
    if (/^\d{17,18}/.test(str) || /^<@!?\d{17,18}>/.test(str)) {
      const member = guild.members.get(/^<@!?\d{17,18}>/.test(str) ? str.replace(/<@!?/, '').replace('>', '') : str)
      return member ? member.user : false
    } else if (str.length <= 33) {
      const isMemberName = (name, str) => name === str || name.startsWith(str) || name.includes(str)
      const member = guild.members.find(m => {
        if (m.nick && isMemberName(m.nick.toLowerCase(), str.toLowerCase())) return true
        return isMemberName(m.user.username.toLowerCase(), str.toLowerCase())
      })
      return member ? member.user : false
    } else return false
  }
/**
 * @arg {String} query
 * @arg {Eris.Guild} guild
 * @arg {Boolean} [exact=false] only look for exact match
 * @returns {?Eris.User}
 */
exports.fineUserInGuild = (query, guilds, exact = false)=>{
    let found = null;
    if(query === undefined || guild === undefined)
        return found;
    query = query.toLowerCase();
    guild.members.forEach(m=>{
        if(m.user.username.toLowerCase() === query) found = m;
    });
    if(!found) guild.members.forEach(m=>{
        if(m.nick !== null && m.nick.toLowerCase() === query) found = m;
    });
    if(!found && exact === false) guild.members.forEach(m=>{
        if(m.user.username.toLowerCase().indexOf(query) === 0)found=m;
    });
    if(!found && exact === false) guild.members.forEach(m =>{
        if(m.nick !== null && m.nick.toLowerCase().indexOf(query) === 0) found =m;
    });
    if(!found && exact === false) guild.members.forEach(m=>{
        if(m.user.username.toLowerCase().includes(query))found =m;
    });
    if(!found && exact === false) guild.members.forEach(m=>{
        if(m.nick!==null && m.nick.toLowerCase().includes(query)) found =m;
    });
    return found === null ? found :found.user;
}

/**
 * Human readable
 * @arg {Number} milliseconds
 * @returns {String}
 */
exports.formatTime = milliseconds =>{
    let daysText = 'days';
    let hoursText = 'hours';
    let minutesText = 'minutes';
    let secondsText = 'seconds';
    let s = milliseconds / 1000;
    let seconds = (s%60).toFixed(0);
    s /= 60;
    let minutes = (s%60).toFixed(0);
    s /=60;
    let hours = (s%24).toFixed(0);
    s /=24;
    let days = s.toFixed(0);

    if(days === 1) daysText = 'day';
    if(hours === 1) hoursText = 'hour';
    if(minutes === 1) minutesText ='minute';
    if(seconds === 1) secondsText = 'second';
    return `${days} ${daysText}, ${hours} ${hoursText}, ${minutes} ${minutesText}, and ${seconds} ${secondsText}`;
}

/**
 * convert human readable
 * @arg {Number} milliseconds
 * @returns {String}
 */
exports.formatSeconds = time =>{
    let days = Math.floor((time % 31536000) / 86400);
    let hours = Math.floor(((time % 31536000) % 86400) / 3600);
    let minutes = Math.floor ((((time %31536000)%86400)%3600)/60);
    let seconds = Math.floor ((((time %31536000)%86400)%3600)%60);
    days = days > 9 ? days :days
    hours = hours > 9 ? hours : hours
    minutes = minutes > 9 ? minutes : minutes
    seconds = seconds > 9 ? seconds : seconds
    return `${days} Days, ${hours} Hours, ${minutes} Minutes and ${seconds} Seconds`
}
/**
 * @param {number}
 * @param {number} precision
 */
exports.round = (value, precision) =>{
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier)/multiplier;
}
/**
 * @param {number} min
 * @param {number} max
 */
exports.getRandomInt = (min,max)=>{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Error printing
 * @param {object} Ai
 * @param {string} commandUsed
 * @param {object} channel
 * @param {object|string} error
 */
exports.handleError = (Ai, commandUsed, channel, error)=>{
    channel.createMessage({
        content :``,
        embed:{
            color: config.errorColor,
            author:{
                name: ``,
                url: ``,
                icon_url: ``,
            },
            description: `${error}\n\nError ded.`
        }
    }).then(()=>{
        Ai.executeWebhook(config.errWebhookID,config.errWebhookToken,{
            embeds:[{
                color: config.errorColor,
                title: `${commandUsed}`,
                description: `**${new Date().toLocaleString()}**${error}\n${error.stack}`,
            }],
            username:`${Ai.user.username}`,
            avatarURL: `${Ai.user.dynamicAvatarURL('png',2048)}`,
        }).catch(err =>{
            logger.error(err, 'Error');
        });
        logger.error(error, 'Error');
    }).catch(err =>{
        logger.error(err, 'Error');
    });
}
/**
 * Handle an error with a message
 * @param {object} Ai client object
 * @param {string} commandUsed file path of the command
 * @param {object|string} error the error that was returned
 */
exports.handleErrorNoMsg = (Ai, commandUsed, error) => {
    Raven.captureException(error);
    Ai.executeWebhook(config.errWebhookID, config.errWebhookToken, {
        embeds: [{
          color: config.errorColor,
          title: `${commandUsed}`,
          description: `**${new Date().toLocaleString()}**\n\n${error}\n${error.stack}`,
        }],
        username: `${Ai.user.username}`,
        avatarURL: `${Ai.user.dynamicAvatarURL('png', 2048)}`
      })
      .catch(err => {
        logger.error(err, 'ERROR');
      });
    logger.error(error, 'ERROR');
  }