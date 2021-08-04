const pkg = require('../package.json');

module.exports = function setupHelp(bot) {
  bot.command(['start', 'help'], (ctx) => {
    ctx.reply(
      `Hi. I'm ${ctx.botInfo.first_name} open-source bot from ${
        pkg.repository
      }. The following is my purpose: ${
        pkg.description || `...oh. Sorry, still in development`
      }.\n\nCry for /help or read the commands list. Might be helpful.`
      // {
      //   disable_web_page_preview: true,
      // }
    );
  });
};
