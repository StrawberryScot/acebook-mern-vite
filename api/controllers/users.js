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

  // console.log("Incoming user ID param:", req.params.id);

  if (!userId || userId.length !== 24) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  // console.log(`THIS IS THE USER ID: ${userId}`);

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


const getUserProfileById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message : "User not found" })
    }

    return res.json({
      firstName: user.firstName, 
      lastName: user.lastName,
      profilePic: user.profilePicPath 
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
  } 

const addFriend = async (req, res) => {
  //get the ids from the request of person adding, and person to be added
  //find the users using the ids
  try {
    const { userSignedIn } = req.body;
    console.log(userSignedIn)
    const user = await User.findById(userSignedIn);
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendToAdd = req.params.id;
    console.log(friendToAdd);
    const friend = await User.findById(friendToAdd);
    console.log(friend);
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    friend.friends.push(userSignedIn);
    await friend.save();
    return res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("addFriend function has an error: ", error);
    return res.status(500).json({ message: "Error adding a friend" });
  }
};

const getUserProfile = async (req, res) => {
  console.log("Auth header:", req.headers.authorization);
  console.log("Request user object:", req.user);
  console.log("Requested profile ID:", req.params.id);
  const userId = req.params.id;
  const requestingUserId = req.user;
  console.log(requestingUserId);

  if (!userId || userId.length !== 24) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(userId).select(
      "firstName lastName email friends status profilePicPath backgroundPicPath isOnlyFriends"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFriend = user.friends.includes(requestingUserId);

    const userProfile = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      profilePicPath: user.profilePicPath,
      backgroundPicPath: user.backgroundPicPath,
      isFriend: isFriend,

      // Only return full friends list if the requesting user is a friend or it's their own profile
      friends:
        isFriend || userId === requestingUserId
          ? user.friends
          : user.friends.length,

      // Include privacy setting only if it's the user's own profile
      ...(userId === requestingUserId && { isOnlyFriends: user.isOnlyFriends }),
    };

    return res.status(200).json(userProfile);
  } catch (err) {
    console.error("Error fetching user profile: ", err);
    res.status(500).json({ message: "Server error" });
  }
};


const UsersController = {
  create,
  getUserByToken,
  getNameById,
  getUserProfileById,
  addFriend: addFriend,
  getUserProfile: getUserProfile,
};

module.exports = UsersController;
