'use strict';
require('dotenv-expand')({
  parsed: require('dotenv-extended').load({
    errorOnMissing: true,
    errorOnExtra: true,
    errorOnRegex: true,
  }),
});

const mailCallback = require('./functions/mailCallback');

const bot = require('./bot');
const mailListener = require('./mailListener');

const { User, Roles } = require('./models');

async function botCallback(htmlText) {
  const users = await User.find({});
  users.forEach((user) => {
    if (user.role >= Roles.invitee) {
      bot.telegram.sendMessage(user._id, htmlText, { parse_mode: 'HTML' }).catch((error) => {
        if (!(error.response && error.response.error_code === 403)) {
          // swallow error if user hasn't started the bot yet or has blocked it, else rethrow
          throw error;
        }
      });
    }
  });
}

function setRestartTimeout() {
  const timeoutS = 5;
  const timeoutMs = timeoutS * 1000;
  console.log(`Mail Listener restart scheduled in ${timeoutS} seconds`);
  return setTimeout(() => {
    console.log('Trying to establish IMAP connection again');
    mailListener.restart();
  }, timeoutMs);
}

mailListener.start();

mailListener.on('server:connected', () => {
  console.log('IMAP account has connected');
});

mailListener.on('server:disconnected', () => {
  console.log('IMAP account has disconnected or server failed');
  setRestartTimeout();
});

mailListener.on('error', (err) => {
  if (err.code === 'ENOTFOUND') {
    return console.log('No Internet connection!');
  }
  console.error(err);
});

mailListener.on('mail', mailCallback(botCallback));

process.once('SIGINT', () => {
  mailListener.stop();
  process.exit();
});
