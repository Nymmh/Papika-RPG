const RESPONSES = [
    "Pong",
    "It's not like I wanted to say pong or anything b-baka!",
    "Pong!",
    "What!?",
    "E-ehh pong?",
    "No",
    "Same",
    "...",
    "Ping!",
    "Meow",
    "*Tabletennis Noises*",
    "Beep!",
    "Bloop.",
    "Bleep Bloop.",
    "Sarcasm self-test complete.",
    "Oh, good, that's back online.",
    "Hi!",
    ":thinking:",
    "MOD ABUSE"
];
const handleError = require('../../util/utils.js').handleError;
let Nf = new Intl.NumberFormat('en-US');
module.exports = {
    desc: "Responds with pong.",
    help: "Pong!",
    aliases: ['p','pong'],
    cooldown: 2,
    guildOnly: false,
    task(Ai, msg) {
      /**
       * perm checks
       * @param {boolean} sendMessages
       * @param {boolean} embedLinks
       */
      const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
      const embedLinks = msg.channel.permissionsOf(Ai.user.id).has('embedLinks');
      if (sendMessages === false) return;
      if (embedLinks === false) return msg.channel.createMessage(`\\❌ I'm missing the \`embedLinks\` permission, which is required for this command to work.`)
        .catch(err => {
          handleError(Ai, __filename, msg.channel, err);
        });
      let choice = ~~(Math.random() * RESPONSES.length);
      Ai.createMessage(msg.channel.id, {
        content: ``,
        embed: {
          color: 0xc16d5b,
          author: {
            name: `${RESPONSES[choice]}`,
            icon_url: ``
          },
          description: ``
        }
      }).then(sentMsg => {
        Ai.editMessage(msg.channel.id, sentMsg.id, {
          content: ``,
          embed: {
            color: 0xc16d5b,
            author: {
              name: `${RESPONSES[choice]}`,
              icon_url: ``
            },
            description: `${Nf.format(sentMsg.timestamp - msg.timestamp)}ms`
          }
        }).catch(err => {
          handleError(Ai, __filename, msg.channel, err);
        });
      }).catch(err => {
        handleError(Ai, __filename, msg.channel, err);
      });
    }
  };