const Post = require("../models/post");
const { generateToken } = require("../lib/token");

async function getAllPosts(req, res) {
  const posts = await Post.find();
  const token = generateToken(req.user_id);
  res.status(200).json({ posts: posts, token: token });
}

async function createPost(req, res) {
  const post = new Post(req.body);
  post.save();

  const newToken = generateToken(req.user_id);
  res.status(201).json({ message: "Post created", token: newToken });
}

async function updatePost(req, res) {
  const updatedPost = await Post.findByIdAndUpdate(
    req.params._id,
    {text: req.body.text},
    { new: true }
  );
  console.log(`id: ${req.params.id}`);
  console.log(updatedPost);

  const newToken = generateToken(req.user_id);
  return res.status(200).json({ 
      message: "Post updated", 
      posts: updatedPost, 
      token: newToken 
    });

}
  const PostsController = {
    getAllPosts: getAllPosts,
    createPost: createPost,
    updatePost: updatePost,
  };


module.exports = PostsController;


