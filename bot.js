const { Telegraf } = require('telegraf');
const ru = require('convert-layout/ru');
const cyrillicToTranslit = require('cyrillic-to-translit-js')();

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

bot.on('text', (ctx, next) => {
  // Terms:
  // layout-converted message — (e.g. `рудз` => `help`)
  // transliterated message — (e.g. `админ` => `admin`)
  const { chat, message } = ctx;

  if (chat.type !== 'private') {
    // bypass if chat is not private
    return next();
  }

  if (message.entities && message.entities.some((entity) => entity.type === 'bot_command')) {
    // bypass if the message is syntactically valid as a command (Telegram's built-in validation)
    return next();
  }

  if (!['/', '.', '?', '÷'].includes(message.text[0])) {
    // bypass if the message wasn't intended to be a command
    return next();
  }

  if (message.text[0] === '/') {
    const translitConverted = cyrillicToTranslit.transform(message.text);
    // reply with transliterated message if the initial message was surely a command
    return ctx.reply(`${translitConverted}?`);
  }

  // layout-convert the initial message
  const layoutConverted = ru.toEn(message.text);

  if (layoutConverted === message.text) {
    // bypass if layout-converted message equals the initial message
    return next();
  }

  // reply with layout-converted message
  return ctx.reply(`${layoutConverted}?`);
  // TODO: implement checking bot.telegram.getMyCommands() for including the converted layout text. Should be turned on by default and controlled with the package constructor
});

bot.launch();

// const commands = [{ command: 'lol', description: 'hah' }];
// bot.telegram.setMyCommands()

// Enable graceful stop for the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
