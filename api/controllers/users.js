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

const getUserByToken = async (req, res) => {
  const tokenObject = decodeToken(req.params.token);

  // checking if the token was decoded successfully:
  if (!tokenObject || !tokenObject.user_id) {
    return res.status(400).json({ error: "Invalid or missing token" });
  }
  try {
    const user = await User.findById(tokenObject.user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fecthing user by token: ", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getNameById = async (req, res) => {
  const userId = req.params.id;
  
  console.log("Incoming user ID param:", req.params.id);

  if (!userId || userId.length !== 24) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  console.log(`THIS IS THE USER ID: ${userId}`);

  try {
    const user = await User.findById(userId).select("firstName lastName");
    if (!user) {
      return res.status(404).json({ message: "User does NOT exist!" });
    }
    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (err) {
    console.error("Error fetching user name by ID: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addFriend = async (req, res) => {
  //get the ids from the request of person adding, and person to be added
  //find the users using the ids
  const {userSignedIn} = req.body;
  const user = await User.findById(userSignedIn);
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }
  
  const friendToAdd = req.params.id;
  const friend = await User.findById(friendToAdd);
  if (!friend){
    return res.status(404).json({message: 'Friend not found'});
  }

  friend.friends.push(userSignedIn);
  await friend.save();
  return res.status(200).json({message:'Friend added successfully'});
}

const UsersController = {
  create: create,
  getUserByToken,
  getNameById,
  addFriend: addFriend
};

module.exports = UsersController;
