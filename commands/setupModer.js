const { findUser } = require('../models');

const checkAdmin = require('../helpers/checkAdmin');

const { BOT_OWNER_ID } = process.env;

module.exports = function setupModer(bot) {
  bot.command('moder', checkAdmin, async (ctx) => {
    if (!ctx.message.reply_to_message) {
      return ctx.reply(
        'Для смены статуса пользователя ответьте на его сообщение (Если такой возможности нет, перешлите его сообщение лично мне — боту, и уже тогда ответьте на него)'
      );
    }
    const tgReceiver =
      ctx.message.reply_to_message.forward_from ?? ctx.message.reply_to_message.from;
    if (tgReceiver.id === ctx.botInfo.id) {
      return ctx.reply('Спасибо, но мне права на модерацию самого себя ни к чему.');
    }
    let user = await findUser(tgReceiver.id);

    if (user._id === ctx.from.id && user._id !== Number(BOT_OWNER_ID)) {
      // reply if user tries to /moder himself AND he is not the bot owner
      return ctx.reply('Интересная идея, но так не сработает.');
    }
    // Reverse isModer
    user.isModer = !user.isModer;
    // Save user
    user = await user.save();
    // Reply with new setting info
    await ctx.reply(
      `Готово, @${tgReceiver.username} ${
        user.isModer ? 'стал модератором' : 'лишился модерской корочки'
      }.`
    );
  });
};
