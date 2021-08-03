'use strict';
require('dotenv-expand')({ parsed: require('dotenv-extended').load() });

const MailListener = require('mail-listener2-updated');
const geocoder = require('google-geocoder');

const mailCallback = require('./functions/mailCallback');

const bot = require('./bot');
const { User } = require('./models');

const { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, GOOGLE_API_KEY } = process.env;

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

const geo = geocoder({
  key: GOOGLE_API_KEY,
});

const mailListener = new MailListener({
  username: MAIL_USERNAME,
  password: MAIL_PASSWORD,
  host: MAIL_HOST,
  port: MAIL_PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

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
