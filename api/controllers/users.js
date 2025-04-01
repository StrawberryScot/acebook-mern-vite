const User = require("../models/user");
const { validatePassword } = require("../middleware/passwordValidator");
const { validateEmail } = require("../middleware/emailValidator");

function create(req, res) {
  const email = req.body.email;
  const password = req.body.password;

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

  const user = new User({ email, password });
  user
    .save()
    .then((user) => {
      console.log("User created, id:", user._id.toString());
      res.status(201).json({ message: "OK" });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "Something went wrong" });
    });
}

const UsersController = {
  create: create,
};

module.exports = UsersController;
