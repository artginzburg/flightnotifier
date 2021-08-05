const TelegrafStatelessQuestion = require('telegraf-stateless-question');

const { invite } = require('../commands/invite');

module.exports = function setupForwarded(bot) {
  const userQuestion = new TelegrafStatelessQuestion('user', (ctx, receiverId) => {
    if (ctx.message && ctx.message.text) {
      const command = ctx.message.text.substring(1).split(' ')[0];
      if (command === 'invite') {
        return invite(ctx, receiverId);
      }
    }
  });

  bot.use(userQuestion.middleware());

  bot.on('message', (ctx, next) => {
    if (ctx.chat.type !== 'private') {
      return next();
    }
    if (!ctx.message) {
      return next();
    }

    const receiver = ctx.message.forward_from;

    if (!receiver) {
      return next();
    }

    return userQuestion.replyWithMarkdown(
      ctx,
      `Предлагаю швырнуть в @${receiver.username} какой-нибудь командой.`,
      receiver.id
    );
  });
};
