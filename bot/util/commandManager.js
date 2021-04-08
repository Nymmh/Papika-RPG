var reload = require('require-reload')(require),
    fs = require('fs'),
    Command = require('./command.js'),
    _Logger = reload('./logger.js'),
    bannedUsers = reload('../json/banned_users.json');

/**
 * @class
 * @classdesc handles directory  of js file {@link Command}
 * @prop {String} prefix commands handled by this CommandManager
 * @prop {String} dir wjere commands are located
 * @prop {Object<Command>} commands loaded {@link Command}
 */
class CommandManager{
    /**
     * @constructor
     * @arg {Object} config Ai's config settings
     * @arg {String} prefix prefix for commandmanager
     * @arg {String} [dir="commands/normal/"] root of commands
     * @arg {String} [color] color to log
     */
    constructor(config, prefix, dir = 'commands/all/', color){
        this.prefix = prefix;
        this.directory = `${__dirname}/../${dir}`;
        this.commands ={};
        this.fallbackCommands = [];
        this.logger = new _Logger(config.logTimestamp,color);
    }
    /**
     * start command manager, load commands
     * @arg {Client} Ai
     * @arg {Object} config config settings
     * @arg {settingsManager} settingsManager ai's {@link settingsManager}
     * @returns {Promise}
     */
    initialize(Ai, config, settingsManager) {
        return new Promise((resolve, reject) => {
          fs.readdir(this.directory, (err, files) => {
            if (err) reject(`Error reading commands directory: ${err}`);
            else if (!files) reject(`No files in directory ${this.directory}`);
            else {
              settingsManager.commandList[this.prefix] = [];
              for (let name of files) {
                if (name.endsWith('.js')) {
                  try {
                    name = name.replace(/\.js$/, '');
                    let command = new Command(name, this.prefix, reload(this.directory + name + '.js'), Ai, config);
                    this.commands[name] = command;
                    settingsManager.commandList[this.prefix].push(name);
                    if (command.fallback) {
                      this.fallbackCommands.push(command);
                    }
                  } catch (e) {
                    this.logger.error(`${e}\n${e.stack}`, 'Error loading command ' + name);
                  }
                }
              }
              resolve();
            }
          });
        });
      }
  /**
   * Called when a message is detected with the prefix. Decides what to do.
   * @arg {Eris} Ai The client.
   * @arg {Eris.Message} msg The matching message.
   * @arg {Object} config The JSON formatted config file.
   * @arg {settingsManager} settingsManager The bot's {@link settingsManager}.
   */
    processCommand(Ai, msg, config, settingsManager) {
        let name = msg.content.replace(this.prefix, '').split(/ |\n/)[0];
        let command = this.checkForMatch(name.toLowerCase());
        let suffix = msg.content.replace(this.prefix + name, '').trim();
        if (command !== null) {
          bannedUsers = reload(__dirname+'/../json/banned_users.json');
          if ((bannedUsers.includes(msg.author.id)) && (msg.author.id !== config.adminIds[0])) return Ai.createMessage(msg.channel.id, `${msg.author.mention}, You have been blacklisted from using any commands.`);
          if (msg.channel.guild !== undefined && !msg.channel.permissionsOf(msg.author.id).has('manageChannels') && settingsManager.isCommandIgnored(this.prefix, command.name, msg.channel.guild.id, msg.channel.id, msg.author.id) === true)
            return;
          this.logCommand(msg, command.name, name);
          return command.execute(Ai, msg, suffix, config, settingsManager, this.logger);
        } else if (name.toLowerCase() === "help") {
          bannedUsers = reload(__dirname+'/../json/banned_users.json');
          if ((bannedUsers.includes(msg.author.id)) && (msg.author.id !== config.adminIds[0])) return Ai.createMessage(msg.channel.id, `${msg.author.mention}, You have been blacklisted from using any commands.`);
          return this.help(Ai, msg, msg.content.replace(this.prefix + name, '').trim());
        } else if (this.fallbackCommands.length > 0) {
          this.logCommand(msg, name, name);
          let commandResults = [];
          for (let i = 0; i < this.fallbackCommands.length; ++i) {
            let command = this.fallbackCommands[i];
            commandResults.push(command.execute(Ai, msg, suffix, config, settingsManager, this.logger));
          }
          return commandResults;
        }
      }
    /**
     * command log
     * @arg {Eris.Message} msg 
     * @arg {String} commandNameToLog
     * @arg {String} commandNameEntered
     */
    logCommand(msg, commandNameToLog, commandNameEntered){
        this.logger.logCommand(msg.channel.guild === undefined ? null : msg.channel.guild.name, msg.author.username, this.prefix + commandNameToLog, msg.cleanContent.replace(this.prefix + commandNameEntered, '').trim());
    }
    /**
     * @arg {String} name
     * @return {?Command} returns matching {@link Command} or false
     */
    checkForMatch(name){
        if(name.startsWith(this.prefix))
            name = name.substr(1);
        for(let key in this.commands){
            if(key === name || this.commands[key].aliases.includes(name))
                return this.commands[key];
        }return null;
    }
    /**
     * HELP COMMAND
     * @arg {Eris} Ai
     * @arg {Eris.Message} msg
     * @arg {String} [command]
     */
    help(Ai, msg, command){
        this.logger.logCommand(msg.channel.guild === undefined ? null : msg.channel.guild.name, msg.author.username, this.prefix + 'help', command);
        if(!command){
            let messageQueue = [];
            let currentMessage = `\n//My command list.`;
            for(let cmd in this.commands){
                if(this.commands[cmd].hidden === true) continue;
                let toAdd = this.commands[cmd].helpDM;
                if(currentMessage.length + toAdd.length >= 1900){//if msg is too long push to reset
                    messageQueue.push(currentMessage);
                    currentMessage = '';
                }currentMessage += '\n' + toAdd;
            }
            messageQueue.push(currentMessage);
            msg.channel.addMessageReaction(msg.id, "❗");
            Ai.getDMChannel(msg.author.id).then(chan =>{
                let sendInOrder = setInterval(()=>{
                    if(messageQueue.length>0)
                    Ai.createMessage(chan.id, '```glsl' + messageQueue.shift() + '```');
                    else clearInterval(sendInOrder);
                },300);
            });
        }else{
            let cmd = this.checkForMatch(command);
            if(cmd === null)
                Ai.createMessage(msg.channel.id, `Command \`${this.prefix}${command}\` not found`);
            else
                //Ai.createMessage(msg.channel.id, cmd.helpMessage);
                Ai.getDMChannel(msg.author.id).then(chan =>{
                    Ai.createMessage(chan.id, cmd.helpMessage);
                },300);
        }
    }
    /**
     * @arg {Client} Ai
     * @arg {String} channelId
     * @arg {String} command
     * @arg {Object} config
     * @arg {settingsManager} settingsManager {@link settingsManager}
     */
    reload(Ai, channelId, command, config, settingsManager){
        fs.access(`${this.directory}${command}.js`, fs.R_OK | fs.F_OK, error =>{
            if(error)
                Ai.createMessage(channelId, 'Command dose not exist');
            else{
                try{
                    if(this.commands.hasOwnProperty(command))
                        this.commands[command].destroy();
                        this.commands[command] = new Command(command, this.prefix, reload(`${this.directory}${command}.js`),config, Ai);
                        Ai.createMessage(channelId, `Command ${this.prefix}${command} loaded`);
                        if(!settingsManager.commandList[this.prefix].includes(command))
                            settingsManager.commandList[this.prefix].push(command);
                }catch(error){
                    this.logger.error(error, 'Error reloading command ' + command);
                    Ai.createMessage(channelId, `Error loading command ${error}`);
                }
            }
        });
    }
}
module.exports = CommandManager;