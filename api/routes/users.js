const express = require("express");
const UsersController = require("../controllers/users");

const router = express.Router();

router.post("/", UsersController.create);
router.get("/:id/name", UsersController.getNameById);
router.get("/:token", UsersController.getUserByToken);

module.exports = router;
