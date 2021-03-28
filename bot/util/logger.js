var chalk = require('chalk'),
    fs = require('fs'),
    log = './log.txt';
/**
 * @class
 * @classdesc Log text to the console.
 * @prop {Boolean} logTimestamp if timestamp should display
 * @prop {String} [commandColor] color for command logging
 */
class Logger{
    /**
     * @constructor
     * @arg {Boolean} logTimestamp if timestamp should display
     * @arg {String} [commandColor] the color for command logging
     */
    constructor(logTimestamp, commandColor){
        this.logTimestamp = !!logTimestamp;
        this.commandColor = commandColor;
    }
    /**
     * @arg {String} value color
     */
    set color(value){
        this.commandColor = value;
    }
    /**
     * @type {String}
     */
    get timestamp(){
        return this.logTimestamp === true ? `[${new Date().toLocaleString()}]` : '';
    }
    /**
     * @arg {String} text
     * @arg {String} background
     * @arg {String} [color]
     */
    logWithBackground(text, background, color){
        return console.log(this.timestamp + (color ? chalk[background][color](text) : chalk[background](text)));
    }
    /**
     * @arg {String} text
     * @arg {String} [color]
     */
    logBold(text, color){
        return console.log(this.timestamp + (color ? chalk.bold[color](text) : chalk.bold(text)));
    }
    /**
     * @arg {String} text
     * @arg {String} [color]
     */
    logWithUnderline(text,color){
        return console.log(this.timestamp + chalk[headerBackground][headercolor || 'black'](`${headerText}`), (color ? chalk[color](text) : text));
    }
    /**
   * Logs something with a header.
   * @arg {String} headerText
   * @arg {String} headerBackground A valid [chalk background color]{@link https://github.com/chalk/chalk#background-colors}.
   * @arg {String} headerColor A valid [chalk color]{@link https://github.com/chalk/chalk#colors}.
   * @arg {String} text
   * @arg {String} [color] A valid chalk color.
   */
  logWithHeader(headerText, headerBackground, headerColor, text, color) {
    return console.log(this.timestamp + chalk[headerBackground][headerColor || 'black'](` ${headerText} `), (color ? chalk[color](text) : text));
  }
    /**
     * @arg {String} [guildName]
     * @arg {String} userName
     * @arg {String} commandName
     * @arg {String} suffix
     */
    logCommand(guildName, userName, commandName, suffix){
        if(guildName){
            fs.appendFile(log,this.timestamp + ` ${guildName} >> ${userName} > ${commandName} ${suffix}\r`,err=>{if(err)console.log(err);return;})
                return console.log(this.timestamp + `${chalk.bold.magenta(guildName)} >> ${chalk.bold.green(userName)} > ${this.commandColor === undefined ? commandName : chalk.bold[this.commandColor](commandName)} ${suffix}`);
        }else{
            fs.appendFile(log,this.timestamp + ` >> ${userName} > ${commandName} ${suffix}\r`,err=>{if(err)console.log(err);return;})
                return console.log(this.timestamp + `${chalk.bold.green(userName)} > ${this.commandColor === undefined ? commandName : chalk.bold[this.commandColor](commandName)} ${suffix}`);
        }
            
        }
    /**
     * @arg {String} text
     * @arg {String} [wText="WARN"]
     */
    warn(text, wText = 'WARN'){
        return console.log(this.timestamp + `${chalk.bgYellow.black(`${wText}`)} ${text}`);
    }
    /**
     * @arg {String} text
     * @arg {String} [eText="ERROR"]
     */
    error(text, eText = 'ERROR'){
        return console.log(this.timestamp + `${chalk.bgRed.black(`${eText}`)} ${text}`);
    }
    /**
     * @arg {String} text
     * @arg {String} [dText="DEBUG"]
     */
    debug(text, dText = 'DEBUG'){
        return console.log(this.timestamp + `${chalk.bgWhite.black(`${dText}`)} ${text}`);
    }
    green(text, dText = 'GREEN'){
        fs.appendFile(log,this.timestamp + ` ${dText} >> ${text}\r`,err=>{if(err)console.log(err);return;})
        return console.log(this.timestamp + `${chalk.bgGreen.black(`${dText}`)} ${text}`);
    }
    /**
     * @arg {String} color
     */
    isValidColor(color){
        return typeof chalk[color] === 'function';
    }
}
module.exports = Logger;