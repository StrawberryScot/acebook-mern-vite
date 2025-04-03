const mongoose = require("mongoose");
require("../mongodb_helper");
// const testUserData = require("../userDataForTest");
const Post = require("../../models/post");

describe("Post model", () => {
  beforeEach(async () => {
    await Post.deleteMany({});
  });
  
  it("create a post with required fields", () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Hello",
    });
    expect(post.postedBy).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(post.text).toEqual("Hello");
    expect(post.img).toBeUndefined();
    expect(post.likes).toEqual([]);
    expect(post.comments).toEqual([]);
  });


  it("requires postedBy", () => {
    const post = new Post({
      text: "Hello",
    })
    const error = post.validateSync();
    expect(error.errors["postedBy"]).toBeDefined();
    expect(error.errors["postedBy"].message).toMatch(/required/)
  });

  it("requires text", () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
    })
    const error = post.validateSync();
    expect(error.errors["text"]).toBeDefined();
    expect(error.errors["text"].message).toMatch(/required/)
  });

  it("saves a post with required fields", async () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Hello",
    });
    await post.save();
    const savedPost = await Post.findById(post._id);
    expect(savedPost._id).toBeDefined();
    expect(savedPost.postedBy).toEqual(post.postedBy);
    expect(savedPost.text).toEqual(post.text);
  });

  it("saves a psot with optional img and comments", async () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Post with contents",
      img: "http://example.com/image.jpg",
      comments: [
        {
          commentedBy: new mongoose.Types.ObjectId(),
          text: "Comment on Post!",
          likes: [new mongoose.Types.ObjectId()],
          replies: [
            {
              repliedBy: new mongoose.Types.ObjectId(),
              text: "Reply to Comment",
              likes: [new mongoose.Types.ObjectId()],
            },
          ],
        },
      ],
    });
    await post.save();
    const savedPost = await Post.findById(post._id);
    expect(savedPost.img).toEqual("http://example.com/image.jpg");
    expect(savedPost.comments.length).toBe(1);
    expect(savedPost.comments[0].text).toEqual("Comment on Post!");
    expect(savedPost.comments[0].replies.length).toBe(1);
    expect(savedPost.comments[0].replies[0].text).toEqual("Reply to Comment");
  });

  it("defaults likes to empty array", async () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Post with empty likes",
    })
    await post.save();
    expect(post.likes).toEqual([]);
  });

  it("validates comment structure", async () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Test post",
      comments: [
        {
          commentedBy: new mongoose.Types.ObjectId(),
          replies: [
            {
              repliedBy: new mongoose.Types.ObjectId(),
              text: "Test reply",
              replies: [
                {
                  repliedBy: new mongoose.Types.ObjectId(),
                  text: "Invalid nested reply",
                },
              ],
            },
          ],
        },
      ],
    });
    const error = post.validateSync();
    expect(error).toBeDefined();
    expect(error.message).toMatch(/validation failed/);
  });
});
