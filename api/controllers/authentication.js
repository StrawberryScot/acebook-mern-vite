const User = require("../models/user");
const { generateToken } = require("../lib/token");
const bcrypt = require("bcryptjs");

async function createToken(req, res) {
    try {
        const { email, password } = req.body;

        //finding user by email:
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Auth Error: User not found");
            return res.status(401).json({ message: "User not found" });
        }

        //checking if password exists before comparing with hashed version:
        if (!user.password) {
            console.error("Auth Error: User has no password stored");
            return res.status(500).json({ message: "Internal server error" });
        }

        //comparing entered password with hashed password:
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Auth Error: Passwords do not match");
            return res.status(401).json({ message: "Password incorrect" });
        }

        //generating JWT token:
        const token = generateToken(user.id);
        res.status(201).json({ token, message: "OK" });
    } catch (error) {
        console.error("Login Error: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

const AuthenticationController = {
    createToken: createToken,
};

module.exports = AuthenticationController;
