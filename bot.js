const { Telegraf } = require('telegraf');

const translayoutTypo = require('./modules/telegraf-translayout-typo');

const setupInvite = require('./commands/invite');
const setupHelp = require('./commands/help');
const setupRoles = require('./commands/roles');

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN env variable must be provided!');
}
const bot = new Telegraf(BOT_TOKEN);

setupInvite(bot);
setupHelp(bot);
setupRoles(bot);

bot.use(translayoutTypo);

bot.launch();

// const commands = [{ command: 'lol', description: 'hah' }];
// bot.telegram.setMyCommands()

// Enable graceful stop for the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
