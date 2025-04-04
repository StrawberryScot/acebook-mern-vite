const User = require("../models/user");
const { validatePassword } = require("../middleware/passwordValidator");
const { validateEmail } = require("../middleware/emailValidator");
const { decodeToken } = require("../lib/token");

function create(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const user = new User({ email, password, firstName, lastName });

    // imported email validator - requires field to be filled in and an email char "@":
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    // imported password validator - checks password is at least 8 char long and has a special char:
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    user.save()
        .then((user) => {
            console.log("User created, id:", user._id.toString());
            res.status(201).json({ message: "OK" });
        })
        .catch((err) => {
            console.error(err);
            res.status(400).json({ message: "Something went wrong" });
        });
}

const getUserByToken = async (req, res) => {
    const tokenObject = decodeToken(req.params.token);
    const user = await User.findById(tokenObject.user_id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    } else {
        return res.status(200).json(user);
    }
};

const UsersController = {
    create: create,
    getUserByToken,
};

module.exports = UsersController;
