const { findUser } = require('../models');

const BOT_OWNER_ID = Number(process.env.BOT_OWNER_ID);

function checkRole(roleEnum) {
  return async (ctx, next) => {
    const user = await findUser(ctx.from.id);

    if (user.role >= roleEnum || user._id === BOT_OWNER_ID) {
      return next();
    }
    return Promise.resolve();
  };
}

module.exports = checkRole;
