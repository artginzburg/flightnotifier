const geocoder = require('google-geocoder');

const { GOOGLE_API_KEY } = process.env;

const geo = geocoder({
  key: GOOGLE_API_KEY,
});

module.exports = geo;
