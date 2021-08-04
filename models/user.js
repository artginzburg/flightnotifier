const mongoose = require('mongoose');

const Roles = {
  // any higher value includes permissions of the value below (recursively)
  superadmin: 5, // can invite admins using /invite admin
  admin: 4, // can invite moders using /invite moder
  moder: 3, // can invite users using /invite
  invitee: 2, // can get notifications from mailListener and /toggle
  guest: 1, // can /start, /help and get a message informing that he hasn't been invited
};
const RolesPseudoEnumArray = Object.values(Roles);

const userSchema = new mongoose.Schema(
  {
    _id: Number,
    role: {
      type: Number,
      enum: RolesPseudoEnumArray,
      default: Roles.guest,
    },
  },
  { versionKey: false }
);

const User = mongoose.model('user', userSchema);

async function findUser(_id) {
  // returns found user or creates user and returns it
  let user = await User.findById(_id);
  if (!user) {
    // Try/catch is used to avoid rare conditions
    try {
      // Create user if it doesn't exist
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
  Roles,
};
