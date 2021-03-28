const findMember = require('../../util/utils.js').findMember,
      fs = require('fs'),
      reload = require('require-reload')(require),
      bannedUsers = reload('../../json/banned_users.json');
module.exports = {
    desc: "Mute a user from using papika",
	  aliases: ['mpapika'],
    cooldown: 5,
    guildOnly: true,
    requiredAccess: "Admin",
    task(Ai, msg, args){
    /**
     * perm checks
     * @param {boolean} sendMessages
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    if (sendMessages === false) return;
    if (!args) return 'wrong usage';
    const str = args + "";
    const user = findMember(msg, str);
    if (!user) return Ai.createMessage(msg.channel.id, {
        content: ``,
        embed: {
          color: 0xa53636,
          author: {
            name: ``,
            url: ``,
            icon_url: ``
          },
          description: `Not a valid guild member.`
        }
      }).catch(err => {
        handleError(Ai, __filename, msg.channel, err);
      });
      let userid = user.id;
      if(user.bot){
        return Ai.createMessage(msg.channel.id, `You can not blacklist bots from using Papika`)
            .catch(err => {
              handleError(Ai, __filename, msg.channel, err);
            });
      }
      if(bannedUsers.includes(userid)){
        return Ai.createMessage(msg.channel.id, `${user.username}#${user.discriminator} is already banned from Papika RPG`)
        .catch(err => {
          handleError(Ai, __filename, msg.channel, err);
        });
      }
      bannedUsers.push(userid);
      let stringy = JSON.stringify(bannedUsers);
      fs.writeFileSync(__dirname+bannedUsers,stringy);
      Ai.createMessage(msg.channel.id, `${user.username}#${user.discriminator} has been banned from using Papika RPG`)
        .catch(err => {
          handleError(Ai, __filename, msg.channel, err);
      });
    }
}