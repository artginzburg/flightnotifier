const { Telegraf } = require('telegraf');

const { BOT_TOKEN } = process.env;

const pkg = require('./package.json');

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN env variable must be provided!');
}
const bot = new Telegraf(BOT_TOKEN);

bot.on('text', (ctx) =>
  ctx.replyWithHTML(
    `Hi. I'm ${bot.botInfo.first_name} open-source bot from ${
      pkg.repository
    }. The following is my purpose: ${
      pkg.description || `...oh, sorry, still in development`
    }.\n\nCry for /help or read the commands list. Might be helpful.`
  )
);

bot.launch();

// Enable graceful stop for the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
