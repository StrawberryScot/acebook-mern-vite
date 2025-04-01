const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicPath: { type: String, default: "", required: false },
  friends: { type: String, default: [], required: false },
  status: { type: [String], default: "Online", required: false },
  backgroundPicPath: { type: String, default: "", required: false },
  isOnlyFriends: { type: Boolean, required: true },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
