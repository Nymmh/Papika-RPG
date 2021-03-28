var Nf = new Intl.NumberFormat('en-US'),
  reload = require('require-reload'),
  _Logger = reload('../util/logger.js'),
  logger,
  version = reload('../package.json').version,
  playingcrap = require('../json/games.json');

module.exports = (Ai, config, games)=>{
  if (logger === undefined)
    logger = new _Logger(config.logTimestamp);
  Ai.shards.forEach(shard => {
    let namez = ~~(Math.random() * playingcrap.length);
    shard.editStatus(null, {
      name: playingcrap[namez],
      type: 0
    });
  });
    logger.logWithHeader('READY', 'bgGreen', 'black', `S:${Nf.format(Ai.guilds.size)} U:${Nf.format(Ai.users.size)} AVG:${Nf.format((Ai.users.size / Ai.guilds.size).toFixed(2))}`);
    USERAGENT = `${Ai.user.username}/${version} - (https://nymh.moe)`;
};