const express = require("express");
const router = express.Router();


const PostsController = require("../controllers/posts");

router.get("/", PostsController.getAllPosts);
router.post("/", PostsController.createPost);
router.put("/:id", PostsController.updatePost);
router.put("/like/:id", PostsController.likeUnlikePost);

module.exports = router;
