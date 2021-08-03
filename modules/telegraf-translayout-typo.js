const ru = require('convert-layout/ru');
const cyrillicToTranslit = require('cyrillic-to-translit-js')();

module.exports = function translayoutTypo(ctx, next) {
  // Terms:
  // layout-converted message — (e.g. `рудз` => `help`)
  // transliterated message — (e.g. `админ` => `admin`)
  const { chat, message } = ctx;

  if (!chat || chat.type !== 'private') {
    // bypass if chat is not private or doesn't exist
    return next();
  }

  if (!message || !message.text) {
    // bypass if message doesn't exist or doesn't contain text (e.g. it's a sticker or a document)
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
};
