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
          userId: new mongoose.Types.ObjectId(),
          text: "Nice post!",
          username: "user123"
        }
      ]
    });
  });

  it("fails to save without required comment fields", async () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Bad comment",
      comments: [
        {
          text: "Missing userId"
        }
      ]
    });
    await expect(post.save()).rejects.toThrow(/userId.*required/);
  });

  it("defaults likes to empty array", async () => {
    const post = new Post({
      postedBy: new mongoose.Types.ObjectId(),
      text: "Post with empty likes",
    })
    await post.save();
    expect(post.likes).toEqual([]);
  })
});
