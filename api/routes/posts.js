const express = require("express");
const router = express.Router();


const PostsController = require("../controllers/posts");

router.get("/", PostsController.getAllPosts);
router.post("/", PostsController.createPost);
router.put("/:id", PostsController.updatePost);
router.delete("/:id", PostsController.deletePost);
router.put("/like/:id", PostsController.likeUnlikePost);
router.post("/:id/comment", PostsController.commentToPost);
router.post("/:postId/comments/:commentId/replies", PostsController.replyToComment);

module.exports = router;
