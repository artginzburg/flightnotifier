const MailListener = require('mail-listener2-updated');

const { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD } = process.env;

const mailListener = new MailListener({
  username: MAIL_USERNAME,
  password: MAIL_PASSWORD,
  host: MAIL_HOST,
  port: MAIL_PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

module.exports = mailListener;
