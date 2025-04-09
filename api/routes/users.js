const express = require("express");
const UsersController = require("../controllers/users");

const router = express.Router();

router.post("/", UsersController.create);
router.get("/:id/name", UsersController.getNameById);
router.get("/:id/profile", UsersController.getUserProfileById); 
router.get("/:token", UsersController.getUserByToken);
router.post("/:id/friend", UsersController.addFriend);



module.exports = router;
