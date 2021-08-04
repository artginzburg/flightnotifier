const checkRole = require('../middlewares/checkRole');
const { Roles } = require('../models');

module.exports = function setupRoles(bot) {
  bot.command('roles', checkRole(Roles.invitee), (ctx) => {
    return ctx.replyWithHTML(
      `<b>Доступные роли в порядке убывания полномочий:</b> ${Object.keys(Roles).join(', ')}`
    );
  });
};
