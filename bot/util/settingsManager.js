var reload = require('require-reload')(require),
    utils = reload('./utils.js'),
    genericSettings = reload('../json/genericSettings.json'),
    commandSettings = reload('../json/commandSettings.json'),
    updateGeneric = false,
    updateCommand = false;

const interval = setInterval(()=>{
    if(updateGeneric === true){
        utils.safeSave('db/genericSettings','.json', JSON.stringify(genericSettings));
        updateGeneric = false;
    }
    if(updateCommand === true){
        utils.safeSave('db/commandSettings','.json', JSON.stringify(commandSettings));
        updateCommand = false;
    }
}, 20000);

function handleShutdown(){
    return Promise.all([utils.safeSave('json/genericSettings', '.json', JSON.stringify(genericSettings)), utils.safeSave('json/genericSettings','.json', JSON.stringify(commandSettings))]);
}
function destroy(){
    clearInterval(interval);
    if(updateGeneric === true)
        utils.safeSave('json/genericSettings', '.json', JSON.stringify(genericSettings));
    if(updateCommand === true)
        utils.safeSave('json/commandSettings', '.json', JSON.stringify(commandSettings));
}
/**
 * Ai's Settings
 * @module settingsManager
 */
 /**
  * @arg {String} guildId
  * @arg {String} [channelId]
  * @arg {String} [message]
  * @returns {Promise}
  */
function setWelcome(guildId, channelId, message){
    return new Promise(resolve =>{
        if(!genericSettings.hasOwnProperty(guildId))
            genericSettings[guildId] = {};
        if(!genericSettings[guildId].hasOwnProperty('welcome')){
            if(message){
                //sets welcome message
                genericSettings[guildId].welcome ={
                    message,
                    channelId
                }; updateGeneric = true;
            }
        }
        removeEmpty(genericSettings, guildId, updateGeneric);
        resolve();
    });
}
/**Gets servers welcome message
 * @arg {String} guild
 * @arg {String} member
 * @arg {Boolean} raw
 * @returns {?Array<String>}
 */
function getWelcome(guild, member, raw){
    if(genericSettingsExistsFor(guild.id, 'welcome'))
        return raw === true ?
        [genericSettings[guild.id].welcome.channelId, genericSettings[guild].welcome.message] : [genericSettings[guild.id].welcome.channelId, genericSettings[guild.id].welcome.message.replace(/\$\{USER\}/gi, member.user.username).replace(/\$\{SERVER\}/gi, guild.name).replace(/\$\{MENTION\}/gi, member.user.mention)];
        return null;
}
/**
 * A list of avalible events.
 * @const
 * @type Array<String>
 * @default
 */
const eventList = ['memberjoined', 'memberleft', 'userbanned', 'userunbanned', 'namechanged', 'nicknamechanged'];
/**
 * @arg {String} guildId
 * @arg {String} [channelId]
 */
function setEventChannel(guildId, channelId){
    if(!channelId && genericSettings.hasOwnProperty[guildId]&&genericSettings[guildId].hasOwnProperty('events')){
        delete genericSettings[guildId].events;
        updateGeneric = true;
        removeIfEmpty(genericSettings, guildId);
    }else if(channelId){
        if(!genericSettings.hasOwnProperty(guildId)){
            genericSettings[guildId] ={
                "events":{
                    channelId,
                    subbed:[]
                }
            };
            updateGeneric = true;
        }else if(genericSettings[guildId].events.channelId !== channelId){
            genericSettings[guildId].events.channelId = channelId;
            updateGeneric = true;
        }
    }
}
/**
 * @arg {Array} eventsArray
 * @arg {Eris.Channel} channel
 * @returns {Promise<Array|String>}
 */
function subEvents(eventArray, channel){
    return new Promise((resolve, reject)=>{
        if(!genericSettings.hasOwnProperty(channel.guild.id))
            genericSettings[channel.guild.id] = {};
        if(!genericSettings[channel.guild.id].hasOwnProperty('events'))
            setEventChannel(channel.guild.id, channel.id);
        eventArray = eventArray.map(i => i.substr(1).toLowerCase());
        let subbedEvents = [];
        for(let e of eventList){
            if(eventArray.includes(e) && !genericSettings[channel.guild.id].events.subbed.includes(e)){
                genericSettings[channel.guild.id].events.subbed.push(e);
                subbedEvents.push(e);
            }
        }
        updateGeneric = true;
        if(subbedEvents.length > 0){
            resolve(subbedEvents);
        }else{
            removeEmpty(genericSettings, channel.guild.id);
            reject('Subbed to nothing');
        }
    });
}
/**
 * @arg {Array} eventArray
 * @arg {Eris.Channel} channel
 * @returns {Promise<Array|String>}
 */
function unsubEvents(eventArray, channel) {
    return new Promise((resolve, reject) => {
        if(!genericSettings.hasOwnProperty(channel.guild.id) || !genericSettings[channel.guild.id].hasOwnProperty('events'))
        return reject('You are not subbed to any events');
    eventArray = eventArray.map(i => i.substr(1).toLowerCase());
    let unsubbedEvents = [];
    for(let e of eventList){
        if(eventArray.includes(e) && genericSettings[channel.guild.id].events.subbed.includes(e)) {
            genericSettings[channel.guild.id].events.subbed.splice(genericSettings[channel.guild.id].events.subbed.indexOf(e), 1);
            unsubbedEvents.push(e);
        }
      }
    if(genericSettings[channel.guild.id].events.subbed.length === 0) {
        delete genericSettings[channel.guild.id].events;
        removeIfEmpty(genericSettings, channel.guild.id);
    }
    updateGeneric = true;
        if(unsubbedEvents.length > 0)
            resolve(unsubbedEvents);
        else
            reject('Unsubbed to nothing');
    });
}
/**
 * @arg {String} guildId
 * @arg {String} eventQue
 * @returns {?String}
 */
function getEventSetting(guildId, eventQue){
    return (genericSettingsExistsFor(guildId, 'events')&&genericSettings[guildId].events.subbed.includes(eventQue) === true) ? genericSettings[guildId].events.channelId : null;
}
/**
 * @arg {String} guildId
 * @returns {?Object}
 */
function getGuildsEvents(guildId){
    return genericSettingsExistsFor(guildId, 'events') ? genericSettings[guildId].events : null;
}

/**
 * A list of commands loaded by the bot by prefix.
 * @type {Object}
 */
var commandList = {};

/**
 * add ignore settings
 * @arg {String} guildId
 * @arg {String} type
 * @arg {String} id
 * @arg {String} command
 * @returns {Promise<Boolean>}
 */
function addIgnoreForUserOrChannel(guildId, type, id, command){
    return new Promise((resolve, reject)=>{
        if(!command || !guildId || !id || (type !== 'userIgnores' && type !== 'channelIgnores'))
            return reject('Invalid arguments');
        if(!commandSettings.hasOwnProperty(guildId))
            commandSettings[guildId] = {};
        if(!commandSettings[guildId].hasOwnProperty(type))
            commandSettings[guildId][type] = {};
        if(!commandSettings[guildId][type].hasOwnProperty(id))
            commandSettings[guildId][type][id] = [];
        let prefix = Object.keys(commandList).find(p=>command.startsWith(p));
        command = command.replace(prefix, '');
        if(command === 'all'){
            if(prefix === undefined)
                commandSettings[guildId][type][id] = ['all'];
            else if(commandSettings[guildId][type][id].length === 0)
                commandSettings[guildId][type][id].push(prefix + 'all');
            else if(!commandSettings[guildId][type][id].includes(prefix + 'all')){
                for(let i = 0; i < commandSettings[guildId][type][id].length; i++){
                    if(commandSettings[guildId][type][id][i][0]===prefix)
                        commandSettings[guildId][type][id].splice(i, 1);
                }
                commandSettings[guildId][type][id].push(prefix + 'all')
            }else return resolve(false);
                updateCommand = true;
                return resolve(true);
        }else if(prefix !== undefined && commandList.hasOwnProperty(prefix) && commandList[prefix].include(command)&& !commandSettings[guildId][type][id].includes('all') && !commandSettings[guildId][type][id].includes(prefix + 'all') && !commandSettings[guildId][type][id].includes(prefix + command)){
            commandSettings[guildId][type][id].push(prefix + command);
            updateCommand = true;
            return resolve(true);
        }
        removeIfEmptyArray(commandSettings[guildId][type],id,updateCommand);
        removeIfEmpty(commandSettings[guildId],type,updateCommand);
        removeIfEmpty(commandSettings,guildId,updateCommand);
        return resolve(false);
    });
}

/**
 * Remove ignore
 * @arg {String} guildId
 * @arg {String} type
 * @arg {String} id
 * @arg {String} command
 * @returns {Promise<Boolean>}
 */
function removeIgnoreForUserOrChannel(guildId, type, id, command){
    return new Promise((resolve, reject) =>{
        if(!command || !guildId || !id || (type !== 'userIgnores' && type !== 'channelIgnores'))
            return reject('Invalid arg');
        if(!commandSettingsExistFor(guildId, type) || !commandSettings[guildId][type].hasOwnProperty(id))
            return resolve(false);
        let prefix = Object.keys(commandList).find(p => command.startsWith(p));
        command = command.replace(prefix, '');
        if(command === 'all'){
            if(prefix === undefined && commandSettings[guildId][type][id].length !== 0){
                delete commandSettings[guildId][type][id];
                removeIfEmpty(commandSettings[guildId], type);
                removeIfEmpty(commandSettings, guildId);
            }else if(commandSettings[guildId][type][id].length !== 0){
                if(commandSettings[guildId][type][id].includes('all')){
                    commandSettings[guildId][type][id] = [];
                    for(let p in commandList){
                        if(p !== prefix && commandList.hasOwnProperty(p))
                            commandSettings[guildId][type][id].push(p + 'all');
                    }
                    if(commandSettings[guildId][type][id].length === 0){
                        delete commandSettings[guildId][type][id];
                        removeIfEmpty(commandSettings[guildId], type);
                        removeIfEmpty(commandSettings, guildId);
                    }
                }else if(commandSettings[guildId][type][id].includes(prefix + 'all')){
                    commandSettings[guildId][type][id].splice(commandSettings[guildId][type][id].indexOf(prefix + 'all'),1);
                    if(commandSettings[guildId][type][id].length === 0){
                        delete commandSettings[guildId][type][id];
                        removeIfEmpty(commandSettings[guildId], type);
                        removeIfEmpty(commandSettings, guildId);
                    }
                }else{
                    for(let i = 0; i < commandSettings[guildId][type][id].length; i++){
                        if(commandSettings[guildId][type][id][i].startsWith(prefix))
                            commandSettings[guildId][type][id].splice(i, 1);
                    }
                    if(commandSettings[guildId][type][id].length === 0){
                        delete commandSettings[guildId][type][id];
                        removeIfEmpty(commandSettings[guildId], type);
                        removeIfEmpty(commandSettings, guildId);
                    }
                }
            }else 
            return resolve(false);
            updateCommand = true;
            return resolve(true);
        }else if(prefix !== undefined && commandList.hasOwnProperty(prefix) && commandList[prefix].includes(command)){
            if(commandSettings[guildId][type][id].includes('all')){
                commandSettings[guildId][type][id] = [];
                for(let p in commandList){
                    if(commandList.hasOwnProperty(p)){
                        if(p === prefix){
                            for(let c of commandList[p]){
                                if(c !== command)
                                    commandSettings[guildId][type][id].push(p + c);
                            }
                        }else
                            commandSettings[guildId][type][id].push(p + 'all');
                    }
                }
            }else if(commandSettings[guildId][type][id].includes(prefix + 'all')){
                commandSettings[guildId][type][id].splice(commandSettings[guildId][type][id].indexOf(prefix + 'all'), 1);
                for(let c of commandList[prefix]){
                    if(c !== command) commandSettings[guildId][type][id].push(prefix + c);
                }
            }else if(commandSettings[guildId][type][id].includes(prefix + command)){
                commandSettings[guildId][type][id].splice(commandSettings[guildId][type][id].indexOf(prefix + command), 1);
            if(commandSettings[guildId][type][id].length === 0){
                delete commandSettings[guildId][type][id];
                removeIfEmpty(commandSettings[guildId], type);
                removeIfEmpty(commandSettings, guildId);
            }
            }else return resolve(false);
            updateCommand = true;
            return resolve(true);
        }return resolve(false);
    });
}
/**
 * is command ignored
 * @arg {String} prefix
 * @arg {String} command
 * @arg {String} guildId
 * @arg {String} channelId
 * @arg {String} userId
 * @returns {Boolean} if the command is ignored
 */
function isCommandIgnored(prefix, command, guildId, channelId, userId){
    if(!command || !guildId || !channelId || !userId)
        return false;
    if(!commandSettings.hasOwnProperty(guildId))
        return false;
    if(commandSettings[guildId].hasOwnProperty('guildIgnores') && (commandSettings[guildId].guildIgnores[0] === 'all' || commandSettings[guildId].guildIgnores.includes(prefix + 'all') || commandSettings[guildId].guildIgnores.includes(prefix + command)))
        return true;
    if(commandSettings[guildId].hasOwnProperty('channelIgnores') && commandSettings[guildId].channelIgnores.hasOwnProperty(channelId) && (commandSettings[guildId].channelIgnores[channelId][0] === 'all' || commandSettings[guildId].channelIgnores[channelId].includes(prefix + 'all') || commandSettings[guildId].channelIgnores[channelId].includes(prefix + command)))
        return true;
    if (commandSettings[guildId].hasOwnProperty('userIgnores') && commandSettings[guildId].userIgnores.hasOwnProperty(userId) && (commandSettings[guildId].userIgnores[userId][0] === 'all' || commandSettings[guildId].userIgnores[userId].includes(prefix + 'all') || commandSettings[guildId].userIgnores[userId].includes(prefix + command)))
        return true;
    return false;
}
/**
 * why ignored
 * @arg {String} guildId
 * @arg {String} type
 * @arg {String} [id]
 * @returns {Array<String>}
 */
function checkIgnoresFor(guildId, type, id){
    if(commandSettings.hasOwnProperty(guildId)){
        if(type === 'guild' && commandSettings[guildId].hasOwnProperty('guildIgnores'))
            return commandSettings[guildId].guildIgnores;
        else if (type === 'channel' && commandSettings[guildId].hasOwnProperty('channelIgnores') && commandSettings[guildId].channelIgnores.hasOwnProperty(id))
            return commandSettings[guildId].channelIgnores[id];
        else if (type === 'user' && commandSettings[guildId].hasOwnProperty('userIgnores') && commandSettings[guildId].userIgnores.hasOwnProperty(id))
            return commandSettings[guildId].userIgnores[id];
    }
        return [];
}
//misc
/**
 * @arg {Eris.Channel} channel
 */
function handleDeletedChannel(channel){
    if(channel.guild !== undefined && genericSettings.hasOwnProperty(channel.guild.id)){
        if(genericSettings[channel.guild.id].hasOwnProperty('welcome') && genericSettings[channel.guild.id].weclome.channelId === cahnnel.id){
            delete genericSettings[channel.guild.id].welcome;
            removeIfEmpty(genericSettings[channel.guild.id], 'welcome');
            updateGeneric = true;
        }
        if(genericSettings[channel.guild.id].hasOwnProperty('events')&& genericSettings[channel.guild.id].events.channelId === channel.id){
            delete genericSettings[channel.guild.id].events;
            removeIfEmpty(genericSettings[channel.guild.id], 'events');
            updateGeneric = true;
        }
        if(genericSettings[channel.guild.id].hasOwnProperty('nsfw')&&genericSettings[channel.guild.id].nsfw.includes(channel.id)){
            genericSettings[channel.guild.id].nsfw.splice(genericSettings[channel.guild.id].nsfw.indexOf(channel.id),1);
            removeIfEmptyArray(genericSettings[channel.guild.id],'nsfw');
            updateGeneric = true;
        }
        removeIfEmpty(genericSettings, channel.guild.id, updateGeneric);
    }
    if(commandSettingsExistFor(channel.guild.id, 'channelIgnores') && commandSettings[channel.guild.id].channelIgnores.hasOwnProperty(channel.id)){
        delete commandSettings[channel.guild.id].channelIgnores[channel.id];
        removeIfEmpty(commandSettings[channel.guild.id], 'channelIgnores');
        removeIfEmpty(commandSettings, channel.guild.id);
        updateCommand = true;
    }
}
//check for special settings
function genericSettingsExistsFor(guildId, settings){
    return genericSettings.hasOwnProperty(guildId)&&genericSettings[guildId].hasOwnProperty(settings);
}
function commandSettingsExistFor(guildId, settings){
    return commandSettings.hasOwnProperty(guildId)&&commandSettings[guildId].hasOwnProperty(settings);
}

//remove unncesary keys
function removeIfEmpty(obj, key, updater){
    if(Object.keys(obj[key]).length === 0){
        delete obj[key];
        if(updater !==  undefined)
            updater = true;
    }
}
function removeIfEmptyArray(obj, key, updater) {
    if (obj[key].length === 0) {
      delete obj[key];
      if (updater !== undefined)
        updater = true;
    }
  }
module.exports={
    destroy,
    handleShutdown,
    setWelcome,
    getWelcome,
    handleDeletedChannel,
    eventList,
    setEventChannel,
    subEvents,
    unsubEvents,
    getEventSetting,
    getGuildsEvents,
    commandList,
    addIgnoreForUserOrChannel,
    removeIgnoreForUserOrChannel,
    isCommandIgnored,
    checkIgnoresFor
};