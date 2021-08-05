const mongoose = require('mongoose');

const { MONGO } = process.env;

if (!MONGO) {
  throw new Error('MONGO env variable must be provided!');
}
mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = require('./user');
