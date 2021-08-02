const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = require('./user');
