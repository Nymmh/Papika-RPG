const handleError = require('../../util/utils.js').handleError,
      axios = require('axios');
      config = require('../../json/config.json'),
      utils = require('../../util/utils'),
      vape = require('./vape');
module.exports = {
    desc: "Use an item in your inventory",
    aliases: ['u'],
    usage: "[item]",
    cooldown: 5,
    guildOnly: true,
    task(Ai, msg, suffix){
        if(!suffix) return 'wrong usage';
        if(suffix == "vape")vape.task(Ai,msg)
    }
}