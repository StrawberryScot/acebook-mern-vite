const Post = require("../models/post");
const User = require("../models/user");
const { generateToken } = require("../lib/token");

async function getAllPosts(req, res) {
  try {
    const posts = await Post.find();
    res.json({ posts });
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getUserPosts(req, res) {
  try {
    const userId = req.params.userId;

    if (userId !== req.user_id) {
      return res.status(403).json({
        message: "Add friend if you want to view their posts!",
      });
    }

    const posts = await Post.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .populate("postedBy", "firstName lastName profilePicPath");

    res.status(200).json({ posts });
  } catch (error) {
    console.log("Error in getUserPosts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function createPost(req, res) {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res.status(400).json({ error: "PostedBy and text are required" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user_id) {
      return res.status(403).json({ error: "Unauthorized to create post" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    // need something for img

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function updatePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user_id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Check if the post belongs to the user trying to update it
    if (post.postedBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }
    // Only update after authorization check passes
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { text: req.body.text },
      { new: true }
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newToken = generateToken(req.user_id);
    return res.status(200).json({
      message: "Post updated",
      posts: updatedPost,
      token: newToken,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

async function deletePost(req, res) {
  const postId = req.params.id;
  const userId = req.user_id;
  const post = await Post.findById(postId);
  //checks if the post actually exists
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  //checks if the post belongs to the user trying to delete it
  if (post.postedBy.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "You are not authorised to delete this" });
  }
  //deletes the post if above checks pass
  await post.deleteOne();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const newToken = generateToken(req.user_id);
  return res
    .status(200)
    .json({ message: "Post deleted successfully", token: newToken });
}

async function likeUnlikePost(req, res) {
  try {
    const { id: postId } = req.params;
    const userId = req.user_id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked" });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function commentToPost(req, res) {
  try {
    const postId = req.params.id;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId); // ensure post exists

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      commentedBy: req.user_id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json(newComment);
  } catch (error) {
    console.error("Error in commentToPost controller", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function replyToComment(req, res) {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = {
      repliedBy: req.user_id,
      text,
    };

    comment.replies.push(newReply);
    await post.save();

    res.status(200).json(newReply);
  } catch (error) {
    console.error("Error in replyToComment controller", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

const PostsController = {
  getAllPosts: getAllPosts,
  getUserPosts: getUserPosts,
  createPost: createPost,
  updatePost: updatePost,
  deletePost: deletePost,
  likeUnlikePost: likeUnlikePost,
  commentToPost: commentToPost,
  replyToComment: replyToComment,
};

module.exports = PostsController;
