'use strict';
require('dotenv-extended').load();

const MailListener = require('mail-listener2-updated');
const geocoder = require('google-geocoder');

const mailCallback = require('./functions/mailCallback');

const bot = require('./bot');

const { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, G_API_KEY, BOT_ADMIN_ID } = process.env;

function botCallback(htmlText) {
  const user = BOT_ADMIN_ID;
  return bot.telegram.sendMessage(user, htmlText, { parse_mode: 'HTML' });
}

const geo = geocoder({
  key: G_API_KEY,
});

const mailListener = new MailListener({
  username: MAIL_USERNAME,
  password: MAIL_PASSWORD,
  host: MAIL_HOST,
  port: MAIL_PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: 'INBOX',
  markSeen: false,
  // searchFilter: ["UNSEEN", "FLAGGED"],
});

mailListener.start();

mailListener.on('server:connected', () => {
  console.log('imapConnected');
});

mailListener.on('server:disconnected', () => {
  console.log('imapDisconnected');
  setTimeout(() => {
    console.log('Trying to establish imap connection again');
    mailListener.restart();
  }, 5 * 1000);
});

mailListener.on('error', (err) => {
  console.log(err);
});

mailListener.on('mail', mailCallback(botCallback, geo));
