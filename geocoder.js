const NodeGeocoder = require('node-geocoder');

const { GOOGLE_API_KEY } = process.env;

const options = {
  provider: 'google',
  apiKey: GOOGLE_API_KEY,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
