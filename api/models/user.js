const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    // firstName: { type: String, required: true },
    // lastName: { type: String, required: true },
    profilePicPath: { type: String, default: "", required: false },
    friends: { type: [String], default: [], required: false },
    status: { type: String, default: "Online", required: false },
    backgroundPicPath: { type: String, default: "", required: false },
    isOnlyFriends: { type: Boolean, default: false, required: false },
});

//hashing password before saving:
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
