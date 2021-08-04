const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: Number,
    startedUsing: Boolean,
    isAdmin: Boolean,
    isModer: Boolean,
  },
  { versionKey: false }
);

const User = mongoose.model('user', userSchema);

async function findUser(_id) {
  let user = await User.findById(_id);
  if (!user) {
    // Try/catch is used to avoid rare conditions
    try {
      user = await new User({ _id }).save();
    } catch (err) {
      user = await User.findById(_id);
    }
  }
  return user;
}

module.exports = {
  User,
  findUser,
};
