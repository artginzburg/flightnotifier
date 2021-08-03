const pkg = require('../package.json');

const { findUser } = require('../models');

module.exports = function setupStartHelp(bot) {
  bot.command(['start', 'help'], async (ctx) => {
    let user = await findUser(ctx.message.from.id);
    if (!user.startedUsing) {
      user.startedUsing = true;
      user = await user.save();
    }
    ctx.replyWithMarkdown(
      `Hi. I'm ${bot.botInfo.first_name} open-source bot from ${
        pkg.repository
      }. The following is my purpose: ${
        pkg.description || `...oh. Sorry, still in development`
      }.\n\nCry for /help or read the commands list. Might be helpful.`
    );
  });
};
