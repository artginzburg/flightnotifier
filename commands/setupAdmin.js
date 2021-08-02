const { findUser } = require('../models');

const checkAdmin = require('../helpers/checkAdmin');

function setupAdmin(bot) {
  bot.command('admin', checkAdmin, async (ctx) => {
    if (!ctx.message.reply_to_message) {
      return ctx.replyWithMarkdown(
        'Для смены статуса пользователя ответьте на его сообщение (Если такой возможности нет, перешлите его сообщение лично мне — боту, и уже тогда ответьте на него)'
      );
    }
    const tgReceiver =
      ctx.message.reply_to_message.forward_from ?? ctx.message.reply_to_message.from;
    if (tgReceiver.id === ctx.botInfo.id) {
      return ctx.replyWithMarkdown('Спасибо, но мне админские права на самого себя ни к чему.');
    }
    let user = await findUser(tgReceiver.id);

    if (user._id === ctx.from.id) {
      return ctx.replyWithMarkdown('Интересная идея, но так не сработает.');
    }
    // Reverse isAdmin
    user.isAdmin = !user.isAdmin;
    // Save user
    user = await user.save();
    // Send new setting
    await ctx.replyWithMarkdown(
      `Теперь @${tgReceiver.username} ${
        user.isAdmin ? 'может мной управлять' : 'лишился админского доступа'
      }!`
    );
  });
}

module.exports = setupAdmin;
