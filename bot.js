const { Telegraf } = require('telegraf');

const translayoutTypo = require('./modules/telegraf-translayout-typo');

const setupAdmin = require('./commands/setupAdmin');

const pkg = require('./package.json');

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN env variable must be provided!');
}
const bot = new Telegraf(BOT_TOKEN);

setupAdmin(bot);

bot.command(['start', 'help'], (ctx) => {
  ctx.replyWithMarkdown(
    `Hi. I'm ${bot.botInfo.first_name} open-source bot from ${
      pkg.repository
    }. The following is my purpose: ${
      pkg.description || `...oh. Sorry, still in development`
    }.\n\nCry for /help or read the commands list. Might be helpful.`
  );
});

bot.use(translayoutTypo);

bot.launch();

// const commands = [{ command: 'lol', description: 'hah' }];
// bot.telegram.setMyCommands()

// Enable graceful stop for the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
