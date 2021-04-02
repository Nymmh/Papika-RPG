if (parseFloat(process.version.node) < 6)
    throw new Error('Install Node 6 or higher.');

let reload = require('require-reload')(require);

let fs = require('fs'),
    Eris = require('eris-additions')(require('eris')),
    axios = require('axios'),
    validateConfig = reload('./util/validateConfig.js'),
    CommandManager = reload('./util/commandManager.js'),
    util = reload('./util/utils.js'),
    settingsManager = reload('./util/settingsManager.js'),
    logger,
    games = reload('./json/games.json'),
    CommandManagers = [],
    events = {},
    config = reload('./json/config.json');

validateConfig(config).catch(() => process.exit(0));
logger = new(reload('./util/logger.js'))(config.logTimestamp);

let Ai = new Eris(config.token, {
    autoReconnect: true,
    disableEveryone: true,
    getAllUsers: true,
    messageLimit: 100,
    sequencerWait: 100,
    moreMentions: true,
    disableEvents: config.disableEvents,
    maxShards: config.shardCount,
    gatewayVersion: 6,
    cleanContent: true
});

USERAGENT = '';
commandsProcessed = 0;

function readyCommands() {
    return new Promise(resolve => {
        CommandManagers = [];
        for (let prefix in config.commandSets) {
            let color = config.commandSets[prefix].color;
            if (color && !logger.isValidColor(color)) {
                logger.warn(`Color for ${prefix} invalid`);
                color = undefined;
            }
            CommandManagers.push(new CommandManager(config, prefix, config.commandSets[prefix].dir, color));
        }
        resolve();
    });
}

function intreadyCommands(index = 0) {
    return new Promise((resolve, reject) => {
        CommandManagers[index].initialize(Ai, config, settingsManager)
            .then(() => {
                logger.debug(`Started the CommandManager ${index}`, 'INT');
                index++;
                if (CommandManagers.length > index) {
                    intreadyCommands(index)
                        .then(resolve)
                        .catch(reject);
                } else resolve();
            }).catch(reject);
    });
}

function LoadEvent() {
    return new Promise((resolve, reject) => {
        fs.readdir(__dirname + '/events/', (err, files) => {
            if (err) reject(`Error reading events directory: ${err}`);
            else if (!files) reject('No files in directory events/');
            else {
                for (let name of files) {
                    if (name.endsWith('.js')) {
                        name = name.replace(/\.js$/, '');
                        try {
                            events[name] = reload(`./events/${name}.js`);
                            initEvent(name);
                        } catch (e) {
                            logger.error(`${e}\n${e.stack}`, 'Error loading ' + name.replace(/\.js$/, ''));
                        }
                    }
                }
                resolve();
            }
        });
    });
}
function initEvent(name) {
    if (name === 'messageCreate') {
        Ai.on('messageCreate', msg => {
            if (msg.content.startsWith(config.reloadCommand) && config.adminIds.includes(msg.author.id))
                reloadModule(msg);
            else events.messageCreate.handler(Ai, msg, CommandManagers, config, settingsManager);
        });
    }else if(name === 'guildMemberAdd'){
        Ai.on('guildMemberAdd', (member,guild) =>{
            events.guildMemberAdd(Ai,guild,member);
        });
    }else if (name === 'Ready') {
        Ai.on('Ready', () => {
            events.ready(Ai, config, games, util);
        });
    } else {
        Ai.on(name, function () {
            events[name](Ai, settingsManager, config, ...arguments);
        });
    }
}

function miscEvents() {
    return new Promise(resolve => {
        if (Ai.listeners('shardReady').length === 0) {
            Ai.on('shardRead', id => {
                logger.logBold(`Shard ${id} Connected`, 'green');
            })
        }
        if (Ai.listeners(`disconected`).length === 0) {
            Ai.on('disconnected', () => {
                logger.logBold('Decon from Discord.gg', 'red');
            });
        }
        if (Ai.listeners('shardResume').length === 0) {
            Ai.on('shardResume', id => {
                logger.logBold(`Shard ${id} resumed`, 'green');
            });
        }
        if(Ai.listeners('guildCreate').length === 0){
            Ai.on('guildCreate', guild =>{
                logger.debug(guild.name, 'Guild Create');
            });
        }
        return resolve();
    });
}

// function reloadCooldowns(){
//     return new Promise(resolve => {
//         axios({
//             url: config.APIurl,
//             method: 'post',
//             data:{
//                 query:`
//                 query{
//                     cooldowns{
//                       name
//                       cooldown
//                     }
//                   }
//                 `,
//             },
//             headers:{
//                 'Content-Type':'application/json'
//             }
//         }).then(result=>{
//             let cooldowns = result.data.data.cooldowns,
//                 cdFile = require('./json/cooldowns.json');
//             for(let cd in cooldowns){
//                 console.log(cdFile[cooldowns[cd].name])
//                 //fs.writeFile('./json/cooldowns.json')
//             }
//         })
//     });
// }

function login() {
    logger.logBold(`Logging in...`, 'green');
    Ai.connect().catch(error => {
        logger.error(error, 'Login Error')
    });
}

readyCommands()
    .then(intreadyCommands)
    .then(LoadEvent)
    .then(miscEvents)
    //.then(reloadCooldowns)
    .then(login)
    .catch(error => {
        logger.error(error, 'Error in ready')
    });

function reloadModule(msg) {
    logger.debug(`${msg.author.username}: ${msg.content}`, 'reload module');
    let arg = msg.content.substr(config.reloadCommand.length).trim();
    for (let i = 0; i < CommandManagers.length; i++) {
        if (arg.startsWith(CommandManagers[i].prefix))
            return CommandManagers[i].reload(Ai, msg.channel.id, arg.substr(CommandManagers[i].prefix.length), config, settingsManager);
    }
    if (arg === 'CommandManagers') {
        readyCommands()
            .then(CommandManagers)
            .then(() => {
                msg.channel.createMessage('reload CommandManagers');
            }).catch(error => {
                logger.error(error, 'ERROR IN INT');
            });
    } else if (arg.startsWith('util/')) {
        fs.access(`${__dirname}/${arg}.js`, fs.R_OK | fs.F_OK, err => {
            if (err)
                msg.channel.createMessage('That file dose not exist');
            else {
                switch (arg.replace(/(util\/|\.js)/g, '')) {
                    case 'CommandManager':
                        CommandsManager = reload('./util/CommandManager.js');
                        msg.channel.createMessage('Reloaded CommandManager.js');
                        break;
                    case 'settingsManager': {
                        let tempCommandList = settingsManager.commandList;
                        settingsManager.destory();
                        settingsManager = reload('./util/settingsManager.js');
                        settingsManager.commandList = tempCommandList;
                        msg.channel.createMessage('Reloaded util/settingsManager.js');
                        break;
                    }
                    case 'util':
                        util = reload('./util/util.js');
                        msg.channel.createMessage('Reloaded util/util.js');
                        break;
                    case 'validateConfig':
                        validateConfig = reload('./util/validateConfig.js');
                        msg.channel.createMessage('Reloaded util/validateConfig.js');
                        break;
                    case 'Logger':
                        logger = new(reload('./util/Logger.js'))(config.logTimestamp);
                        msg.channel.createMessage('Reloaded util/Logger.js');
                        break;
                    default:
                        msg.channel.createMessage("Already loaded cant relaod");
                        break;
                }
            }
        });
    } else if (arg.startsWith('events/')) {
        arg = arg.substr(7);
        if (events.isSelfProperty(arg)) {
            events[arg] = reload(`./events${arg}.js`);
        } else
            msg.channel.createMessage("that event isnt loaded");
    } else if (arg.startsWith('special/')) {
        switch (arg.substr(8)) {
            case 'games':
                games = relaod('./special/games.json');
                msg.channel.createMessage('Realoaded games');
                break;
            default:
                msg.channel.createMessage("Not found");
                break;
        }
    } else if (arg === 'config') {
        validateConfig = reload('./util/validateConfig.js');
        config = reload('./json/config.json');
        validateConfig(config).catch(() => process.exit(0));
        msg.channel.createMessage("Reloaded config");
    }
}

setInterval(()=>{
    if(games.length !== 0 && Ai.uptime !== 0 && config.cycleGames === true){
        Ai.shards.forEach(shard => {
            let name = games[~~(Math.random() * games.length)];
            //name = name.replace(/\$\{GUILDSIZE\}/gi, Ai.guilds.size);
            //name = name.replace(/\$\{USERSIZE\}/gi, Ai.users.size);
            shard.editStatus(null,{
                name: name,
                type: 0
            });
        });
    }
}, 600000);

process.on('SIGINT', () =>{
    Ai.disconect({reconnect: false});
    settingsManager.handleShutdown().then(()=>process.exit(0));
    setTimeout(()=> {process.exit(0);},5000);
});

process.on("uncaughtException", err => {
    logger.error(err);
});

process.on("unhandledRejection", err => {
    logger.error(err);
});