const mongoose = require("mongoose");
require("../mongodb_helper");
const Comment = require("../../models/comment");
const Post = require("../../models/post");

describe("Comment model", () => {
  beforeEach(async () => {
    await Post.deleteMany({});
  });

  it("createa a comment with required fields", () => {
    const comment = new Comment({
      commenterId: new mongoose.Types.ObjectId(),
      text: "Hello",
    });
    expect(comment.commenterId).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(comment.text).toEqual("Hello");
    expect(comment.replies).toEqual([]);
  });
  
  it("requires commenterId", () => {
    const comment = new Comment({
        text: "Hello",
    });
    const error = comment.validateSync();
    expect(error.errors["commenterId"]).toBeDefined();
    expect(error.errors["commenterId"].message).toMatch(/required/);
  });

  it("requires text", () => {
    const comment = new Comment({
      commenterId: new mongoose.Types.ObjectId(),
    });
    const error = comment.validateSync();
    expect(error.errors["text"]).toBeDefined();
    expect(error.errors["text"].message).toMatch(/required/);
  });

  it("saves a comment with required fields", async () => {
    const comment = new Comment({
        commenterId: new mongoose.Types.ObjectId(),
        text: "Hello",
    });
    await comment.save();
    const saveComment = await Comment.findById(comment._id);
    expect(saveComment._id).toBeDefined();
    expect(saveComment.commenterId).toEqual(comment.commenterId);
    expect(saveComment.text).toEqual(comment.text);
  });

  it("defaults likes to empty array", async () => {
    const comment = new Comment({
      commenterId: new mongoose.Types.ObjectId(),
      text: "Comment with empty likes",
    })
    await comment.save();
    expect(comment.likes).toEqual([]);
  });
});