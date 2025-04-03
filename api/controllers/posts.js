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
;}

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
      return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
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
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {text: req.body.text},
    { new: true }
  );

  console.log(`id: ${req.params.id}`);
  console.log(updatedPost);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const newToken = generateToken(req.user_id);
  return res.status(200).json({ 
      message: "Post updated", 
      posts: updatedPost, 
      token: newToken 
    });
  }
async function deletePost(req, res) {
  const postId = req.params.id;
  const userId = req.user_id;
  const post = await Post.findById(postId)
  //checks if the post actually exists
  if (!post) {
    return res.status(404).json({message:"Post not found"});
  }
  //checks if the post belongs to the user trying to delete it
  if (post.postedBy.toString() !== userId.toString()){
    return res.status(403).json({message:"You are not authorised to delete this"})
  }
  //deletes the post if above checks pass
  await post.deleteOne()
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newToken = generateToken(req.user_id);
  return res.status(200).json({message:"Post deleted successfully", token:newToken})
}



  const PostsController = {
    getAllPosts: getAllPosts,
    createPost: createPost,
    updatePost: updatePost,
    deletePost: deletePost,
  };

module.exports = PostsController;
