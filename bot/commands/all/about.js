const reload = require('require-reload'),
  config = reload('../../json/config.json'),
  handleError = require('../../util/utils.js').handleError,
  PapikaVersion = require('../../package.json').version,
  github = require('../../json/config.json').homepage;

module.exports = {
  desc: "Tells you about Papika RPG.",
  aliases: ['info', 'papika'],
  cooldown: 5,
  guildOnly: true,
  task(Ai, msg) {
    /**
     * perm checks
     * @param {boolean} sendMessages
     * @param {boolean} embedLinks
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    const embedLinks = msg.channel.permissionsOf(Ai.user.id).has('embedLinks');
    if(sendMessages === false) return;
    if(embedLinks === false) return msg.channel.createMessage(`\\❌ I'm missing the \`embedLinks\` permission, which is required for this command to work.`)
      .catch(err => {
        handleError(Ai, __filename, msg.channel, err);
      });
    const prefix = Object.keys(config.commandSets);
    msg.channel.createMessage({
        content: ``,
        embed: {
          color: config.defaultColor,
          type: 'rich',
          author: {
            name: `Papika`,
            url: github,
            icon_url: `${Ai.user.avatarURL}`
          },
          description: ``,
          thumbnail: {
            url: `${Ai.user.avatarURL}`
          },
          fields: [{
              name: `Creator:`,
              value: `<@!135632493217972224>\n(${Ai.users.get('135632493217972224').username}#${Ai.users.get('135632493217972224').discriminator})`,
              inline: true
            },
            {
              name: `Papika Version:`,
              value: `v${PapikaVersion}`,
              inline: true
            },
            {
              name: `Prefix:`,
              value: `\`${prefix}\``,
              inline: true
            }
          ]
        }
      })
      .catch(err => {
        handleError(Ai, __filename, msg.channel, err);
      });
  }
};