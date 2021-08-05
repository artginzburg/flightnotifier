const checkRole = require('../middlewares/checkRole');
const { findUser, Roles } = require('../models');

const BOT_OWNER_ID = Number(process.env.BOT_OWNER_ID);

async function invite(ctx, receiverId) {
  if (!ctx.message.reply_to_message) {
    return ctx.replyWithHTML(
      `Для отправки приглашения ответьте на сообщение пользователя или перешлите его мне — @${ctx.botInfo.username}\n\nUsage: /invite role\n(<b>role</b> left empty implies the second lowest one from /roles)`
    );
  }

  const receiver = receiverId
    ? await ctx.telegram.getChat(receiverId)
    : ctx.message.reply_to_message.forward_from ?? ctx.message.reply_to_message.from;

  if (receiver.id === ctx.botInfo.id) {
    return ctx.reply('Спасибо, но мне права на самого себя ни к чему.');
  }

  const sender = ctx.from;

  let receiverDb = await findUser(receiver.id);

  if (receiverDb._id === sender.id && receiverDb._id !== BOT_OWNER_ID) {
    // reply if user tries to /invite himself AND he is not the bot owner
    return ctx.reply('Интересная идея, но так не сработает.');
  }

  const command = ctx.message.entities[0];
  let roleName = ctx.message.text.substr(command.length + 1).trim();

  let roleToGive = Roles[roleName];

  if (roleName && !roleToGive) {
    return ctx.reply(`Роли "${roleName}" не существует.`);
  }

  if (!roleName) {
    roleName = 'invitee';
    roleToGive = Roles[roleName];
  }

  const senderDb = await findUser(sender.id);
  if (roleToGive >= senderDb.role && senderDb._id !== BOT_OWNER_ID) {
    return ctx.reply('Выданная роль не может быть >= Вашей собственной.');
  }

  if (senderDb.role < receiverDb.role && senderDb._id !== BOT_OWNER_ID) {
    return ctx.reply('Пожалуйста, соблюдайте субординацию.');
  }
  if (senderDb.role === receiverDb.role && senderDb._id !== BOT_OWNER_ID) {
    return ctx.reply('Пожалуйста, относитесь к коллегам с уважением.');
  }

  receiverDb.role = roleToGive;
  receiverDb = await receiverDb.save();

  // Reply with new setting info
  await ctx.reply(`Теперь @${receiver.username} — ${roleName}!`);
}

function setupInvite(bot) {
  bot.command('invite', checkRole(Roles.moder), (ctx) => invite(ctx));
}

module.exports = {
  setupInvite,
  invite,
};
