const { findUser } = require('../models');

const { BOT_OWNER_ID } = process.env;

async function checkAdmin(ctx, next) {
  const user = await findUser(ctx.from.id);

  if (user.isAdmin || ctx.from.id === Number(BOT_OWNER_ID)) {
    return next();
  }
  return Promise.resolve();
}

module.exports = checkAdmin;
