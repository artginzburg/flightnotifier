'use strict';
require('dotenv-expand')({ parsed: require('dotenv-extended').load() });

const mailCallback = require('./functions/mailCallback');

const bot = require('./bot');
const geo = require('./geo');
const mailListener = require('./mailListener');

const { User } = require('./models');

async function botCallback(htmlText) {
  const users = await User.find({});
  users.forEach((user) => {
    if (user.startedUsing && user.isAdmin) {
      bot.telegram.sendMessage(user._id, htmlText, { parse_mode: 'HTML' }).catch((error) => {
        if (!(error.response && error.response.error_code === 403)) {
          // bypass error if user hasn't started the bot yet or blocked it
          throw error;
        }
      });
    }
  });
}

mailListener.start();

mailListener.on('server:connected', () => {
  console.log('IMAP account has connected');
});

mailListener.on('server:disconnected', () => {
  console.log('IMAP account has disconnected or server failed');
  setTimeout(() => {
    console.log('Trying to establish IMAP connection again');
    mailListener.restart();
  }, 5 * 1000);
});

mailListener.on('error', console.error);

mailListener.on('mail', mailCallback(botCallback, geo));

process.once('SIGINT', () => {
  mailListener.stop();
  process.exit();
});
