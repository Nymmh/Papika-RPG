/**
 * @class
 * @classdesc
 * @prop {String} name Command name
 * @prop {String} prefix command prefix
 * @prop {String} usage how to use command
 * @prop {String} desc description of command
 * @prop {String} help detailed help of command
 * @prop {Function} task when command is executed
 * @prop {Array<String>} aliases alias of command prinited in array fashion
 * @prop {Number} cooldown if the command has a cooldown, prinited in seconds
 * @prop {Boolean} hidden if the command is hidden from help
 * @prop {Boolean} ownerOnly if the command is only for an admin
 * @prop {Boolean} guildOnly if the command is a guild only command
 * @prop {Boolean} fallback if the command should execute when there are no other matching commands
 * @prop {String} requirePermission permission needed to execute the command
 * @prop {Number} timesUsed how many times the command has been used
 * @prop {Set} usersOnCooldown track if the user is still on cooldown
 * @prop {Function} destoryFunction destroy at end
 * @prop {String} requiredPermission
 * @prop {String} channel the channel that the command is locked to
 * @prop {Boolean} beta if the command is a beta command
 */
class Command{
    /**
     * @constructor
     * @arg {String} name Command name
     * @arg {String} prefix command prefix
     * @arg {Object} cmd contains properties for the function to run
     * @arg {String} [cmd.usage=""]
     * @arg {String} [cmd.desc="No description"]
     * @arg {String} [cmd.help="No description"]
     * @arg {Function} cmd.task
     * @arg {Array<String>} [cmd.aliases=[]]
     * @arg {Number} [cmd.cooldown=0]
     * @arg {Boolean} [cmd.hidden=false]
     * @arg {Boolean} [cmd.ownerOnly=false]
     * @arg {Boolean} [cmd.guildOnly=false]
     * @arg {Boolean} [cmd.fallback=false]
     * @arg {String} [cmd.requiredPermission=null] discord [permission]{@link https://abal.moe/Eris/reference.html}
     * @arg {Function} [cmd.initialize] function that runs on start and is passed onto client
     * @arg {Function} [cmd.destroy] function that ends on destruction
     * @arg {Client} Ai the client
     * @arg {Object} config Ai's config (handle with care)
     * @arg {String} [cmd.requiredPermission=null]
     * @arg {String} [cmd.channel=""]
     * @arg {Boolean} [cmd.beta=false]
     */
    constructor(name, prefix, cmd, Ai, config){
        this.name = name;
        this.prefix = prefix;
        this.usage = cmd.usage || "";
        this.desc = cmd.desc || "No description";
        this.help = cmd.help || cmd.desc || this.desc;
        this.task = cmd.task;
        this.aliases = cmd.aliases || [];
        this.cooldown = cmd.cooldown || 0;
        this.hidden = !!cmd.hidden;
        this.ownerOnly = !!cmd.ownerOnly;
        this.guildOnly = !!cmd.guildOnly;
        this.fallback = !!cmd.fallback;
        this.requiredPermission = cmd.requiredPermission || null;
        this.timesUsed = 0;
        this.usersOnCooldown = new Set();
        this.destroyFunction = cmd.destroy;
        this.requiredAccess = cmd.requiredAccess || null;
        this.channel = cmd.channel || "";
        this.beta = !!cmd.beta;
        if(typeof cmd.initialize === 'function')cmd.initialize(Ai, config);
    }
    /**
     * Tell user how to use command
     * @type {String}
     */
    get correctUsage(){
        return `${this.prefix}${this.name} ${this.usage}`;
    }
    /**
     * command DM
     * @type {String}
     */
    get helpDM(){
        return `${this.prefix}${this.name} ${this.usage}\n\t# ${this.desc}`;
    }
    /**
     * reponse to help
     * @type {String}
     */
    get helpMessage(){
        return `**=> Command:**\`${this.prefix}${this.name} ${this.usage}\`
        **=> Info:** ${this.help}
        **=> Cooldown:** ${this.cooldown} seconds
        **=> Aliases:** ${this.aliases.join(', ')||"None"}
        **=> Channel:** ${this.channel || "All"}`;
    }
    /**
     * execute the command if wrong usage retures "wrong usage" will show {@link Command#correctUsage}
     * @arg {Eris} Ai client
     * @arg {Eris.Message} msg trigger
     * @arg {String} suffix arg after command
     * @arg {Object} config config of object
     * @arg {settingsManager} settingsManager
     */
    execute(Ai, msg, suffix, config, settingsManager, logger) {
        if (this.ownerOnly === true && !config.adminIds.includes(msg.author.id)) // ownerOnly check
          return msg.channel.createMessage('Only the owner of this bot can use that command.').then(sentMsg => {
            setTimeout(() => {
              msg.delete();
              sentMsg.delete();
            }, 6000);
          });
        if(this.disableCommand === true)
          return msg.channel.createMessage('This command is currently disabled.');
        if (this.guildOnly === true && msg.channel.guild === undefined) // guildOnly check
          return msg.channel.createMessage('This command can only be used in a server.');
        if (this.requiredPermission !== null && !config.adminIds.includes(msg.author.id) && !msg.channel.permissionsOf(msg.author.id).has(this.requiredPermission)) // requiredPermission check
          return msg.channel.createMessage(`You need the ${this.requiredPermission} permission to use this command.`).then(sentMsg => {
            setTimeout(() => {
              msg.delete();
              sentMsg.delete();
            }, 6000);
          });
        if(this.beta === true && msg.channel.id !== "828379675100577804" && msg.channel.id !== "828376497705713715")return msg.delete();
        if (this.usersOnCooldown.has(msg.author.id)) { // Cooldown check
          return msg.channel.createMessage(`${msg.author.username}, this command can only be used every ${this.cooldown} seconds.`).then(sentMsg => {
            setTimeout(() => {
              msg.delete();
              sentMsg.delete();
            }, 6000);
          });
        }
        if(this.channel !== "" && msg.channel.name != this.channel && msg.channel.id !== "828376497705713715"){
          let channelid = "";
          if(this.channel == "job")channelid = "828227608398266379";
          else if(this.channel == "house")channelid = "828227743757500436";
          else if(this.channel == "store")channelid = "828227627538055169";
          return msg.channel.createMessage(`${msg.author.username}, this command can only be used in the <#${channelid}> channel`).then(sentMsg => {
            setTimeout(() => {
              msg.delete();
              sentMsg.delete();
            }, 10000);
          });
        }
        let result;
        this.timesUsed++;
        commandsProcessed++;
        try{
            result = this.task(Ai, msg, suffix, config, settingsManager); //execute command after all those checks
        }catch(err){
            logger.error(`${err}\n${err.stack}`, 'Command error');
            if(config.errorMessage)
                msg.channel.createMessage(config.errorMessage);
        }
        if(result === 'wrong usage'){
            msg.channel.createMessage(`${msg.author.username}, use the following format to execute the command: \n**\`${this.prefix}${this.name} ${this.usage}\`**`).then(sentMsg =>{
                setTimeout(()=>{
                    msg.delete();
                    sentMsg.delete();
                },10000);
            });
        }else if(!config.adminIds.includes(msg.author.id)){
            this.usersOnCooldown.add(msg.author.id);
            setTimeout(()=>{//add user to cooldown and track cooldown
                this.usersOnCooldown.delete(msg.author.id);
            },this.cooldown * 1000);
        }
    }
    fineMembers(msg, str){
        if(!str || str === '') return false
        const guild = msg.channel.guild
        if(!guild) return msg.mentions[0] ? msg.mentions[0]:false
        if(/^\d{17,18}/.test(str) || /^<@!?\d{17,18}>/.test(str)){
            const member = guild.members.get(/^<@!?\d{17,18}>/.test(str)?str.replace(/<@!?/,'').replace('>',''):str)
            return member ? member.user:false
        }else if(str.length <= 33){
            const isMemberName = (name, str) => name === str || name.startsWith(str) || name.includes(str)
            const member = guild.member.find(m=>{
                if(m.nick && isMemberName(m.nick.toLowerCase(),str.toLowerCase())) return true
                return isMemberName(m.user.username.toLowerCase(), str.toLowerCase())
            })
            return member ? member.user : false
        }else return false
    }
    round(value, percision){
        var multipier = Math.pow(10,percision || 0);
        return Math.round(value * multipier) / multipier;
    }
    /**
     * destory command
     */
    destroy(){
        if(typeof this.destroyFunction === 'function')
            this.destroyFunction();
    }
}
module.exports = Command;