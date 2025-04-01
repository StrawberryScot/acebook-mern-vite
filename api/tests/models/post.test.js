require("../mongodb_helper");
const testPostData = require("../postDataForTest");

const Post = require("../../models/post");

describe("Post model", () => {
  beforeEach(async () => {
    await Post.deleteMany({});
  });

  it("has a message", () => {
    const post = new Post(testPostData);
    expect(post.text).toEqual("some message");
  });

  it("can list all posts", async () => {
    const posts = await Post.find();
    expect(posts).toEqual([]);
  });

  it("can save a post", async () => {
    const post = new Post(testPostData);

    await post.save();
    const posts = await Post.find();
    expect(posts[0].text).toEqual("some message");
  });
});
