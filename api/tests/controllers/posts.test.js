const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const Post = require("../../models/post");
const User = require("../../models/user");
const testUserData = require("../userDataForTest");
const { default: mongoose } = require("mongoose");
const { likeUnlikePost } = require("../../controllers/posts");

require("../mongodb_helper");

const secret = process.env.JWT_SECRET;

function createToken(userId) {
  return JWT.sign(
    {
      user_id: userId,
      iat: Math.floor(Date.now() / 1000) - 5 * 60,
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
  );
}

describe("/posts", () => {
  let user;
  let token;

  beforeEach(async () => {
    await Post.deleteMany({});
  });

  beforeAll(async () => {
    try {
      user = new User(testUserData);
      await user.save({ timeout: 5000 });
      token = createToken(user._id.toString());
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  beforeEach(async () => {
    await Post.deleteMany({});
  });

  afterEach(async () => {
    await Post.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /posts with token", () => {
    test("returns 200 and all posts", async () => {
      const post = new Post({ postedBy: user._id, text: "Test post" });
      await post.save();

      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.posts.length).toEqual(1);
      expect(response.body.posts[0].text).toEqual("Test post");
    });
  });

  describe("POST /posts with token", () => {
    test("creates a post and returns 201", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ postedBy: user._id.toString(), text: "Hello World" });

      expect(response.status).toEqual(201);
      expect(response.body.text).toEqual("Hello World");
      expect(response.body.postedBy).toEqual(user._id.toString());

      const posts = await Post.find();
      expect(posts.length).toEqual(1);
    });

    test("rejects if postedBy doesnot match token user", async () => {
      const otherUser = new User({
        email: "other@example.com",
        password: "pass",
        firstName: "Other",
        lastName: "User",
      });
      await otherUser.save();

      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ postedBy: otherUser._id.toString(), text: "Sneaky post" });

      expect(response.status).toEqual(403);
      expect(response.body.error).toEqual("Unauthorized to create post");
    });

    test("rejects if text exceeds 500 chars", async () => {
      const longText = "a".repeat(501);
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ postedBy: user._id.toString(), text: longText });

      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual(
        "Text must be less than 500 characters"
      );
    });
  });

  describe("POST /posts without token", () => {
    test("returns 401", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ postedBy: user._id.toString(), text: "No token" });

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("auth error");
    });
  });

  // Tests for updating a post

  describe("PUT, when a valid token is present", () => {
    let token;
    let user;
    let post1; // Declare token variable to use in your tests

    beforeEach(async () => {
      // Clear posts before each test
      await Post.deleteMany({});

      // beforeAll(async () => {
      //   // Create a user and generate a token before the tests run
      testUserData.email = "post-test@test.com";
      testUserData.password = "12345678";
      user = new User(testUserData);
      await user.save({ timeout: 5000 });

      // Generate a token
      token = createToken(user._id.toString());

      post1 = new Post({
        postedBy: user._id,
        text: "I am an original post!",
      });

      // Save the post to the database
      await post1.save();
    });

    afterEach(async () => {
      // Clean up after each test
      await Post.deleteMany({});
    });

    test("responds with a 200", async () => {
      const response = await request(app)
        .put(`/posts/${post1._id.toString()}`) // Use the actual post's _id
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "I am an updated post!" });

      expect(response.status).toEqual(200);
    });

    test("updates an exisiting post", async () => {
      // testUserData.email = "post-test@test.com";
      // testUserData.password = "12345678";
      // const user = new User(testUserData);
      // await user.save({ timeout: 5000 });

      // await request(app);
      // const post1 = new Post({
      //   postedBy: user._id,
      //   text: "I am an original post!",
      // });

      // await post1.save();

      await request(app)
        .put(`/posts/${post1._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "I am an updated post!" });

      const posts = await Post.find();

      expect(posts.length).toEqual(1);
      expect(posts[0].text).toEqual("I am an updated post!");
    });

    test("returns a new token", async () => {
      // testUserData.email = "post-test@test.com";
      // testUserData.password = "12345678";
      // const user = new User(testUserData);
      // await user.save({ timeout: 5000 });

      // const testApp = request(app);

      // await request(app);
      // const post1 = new Post({
      //   postedBy: user._id,
      //   text: "I am an original post!",
      // });

      // await post1.save();

      const response = await request(app)
        .put(`/posts/${post1._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "I am an updated post!" });

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
    });

    test("delete a single post", async () => {
      const response = await request(app)
        .delete(`/posts/${post1._id.toString()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Post deleted successfully");

      const deletedPost = await Post.findById(`${post1._id.toString()}`);
      expect(deletedPost).toBeNull();
    });
  });

  // Test like and unlike
  describe("PUT /like/:id", () => {
    let likeUser;
    let likeToken;
    let likePost;

    beforeAll(async () => {
      likeUser = new User(testUserData);
      await likeUser.save();

      likeToken = createToken(likeUser._id.toString());
    });

    beforeEach(async () => {
      await Post.deleteMany({});
      likePost = new Post({
        postedBy: likeUser._id,
        text: "Test post for liking",
        likes: [],
      });
      await likePost.save();
    });

    afterAll(async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
    });

    describe("PUT /like/:id with valid token", () => {
      test("likes a post when not previously liked", async () => {
        const response = await request(app)
          .put(`/posts/like/${likePost._id}`)
          .set("Authorization", `Bearer ${likeToken}`);

        expect(response.status).toEqual(200);
        expect(response.body.message).toEqual("Post liked");

        const updatedPost = await Post.findById(likePost._id);
        expect(updatedPost.likes).toContainEqual(likeUser._id);
        expect(updatedPost.likes.length).toEqual(1);
      });

      test("unlikes a post when previously liked", async () => {
        await Post.updateOne(
          { _id: likePost._id },
          { $push: { likes: likeUser._id } }
        );

        const response = await request(app)
          .put(`/posts/like/${likePost._id}`)
          .set("Authorization", `Bearer ${likeToken}`);

        expect(response.status).toEqual(200);
        expect(response.body.message).toEqual("Post unliked");

        const updatedPost = await Post.findById(likePost._id);
        expect(updatedPost.likes).not.toContainEqual(likeUser._id);
        expect(updatedPost.likes.length).toEqual(0);
      });

      test("returns 404 for non-existent post", async () => {
        const invalidPostId = new mongoose.Types.ObjectId(); // Create a random valid looking id, that doesn't exist.
        const response = await request(app)
          .put(`/posts/like/${invalidPostId}`)
          .set("Authorization", `Bearer ${likeToken}`);

        expect(response.status).toEqual(404);
        expect(response.body.error).toEqual("Post not found");
      });

      test("returns 401 without token", async () => {
        const response = await request(app).put(`/posts/like/${likePost._id}`);

        expect(response.status).toEqual(401);
      });

      test("returns 500 on database error", async () => {
        // Mock Post.findById to throw an error
        const findByIdMock = jest
          .spyOn(Post, "findById")
          .mockRejectedValue(new Error("Database error"));

        const response = await request(app)
          .put(`/posts/like/${likePost._id}`)
          .set("Authorization", `Bearer ${likeToken}`);

        expect(response.status).toEqual(500);
        expect(response.body.error).toEqual("Database error");

        findByIdMock.mockRestore(); // Restore the original function
      }, 10000); // give the connection to Atlas MongoDB more time to operate
    });
  });

  describe("POST /:id/comment", () => {
    let user;
    let token;
    let post;

    beforeEach(async () => {
      user = new User(testUserData);
      await user.save();
      token = createToken(user._id.toString());
      post = new Post({ postedBy: user._id, text: "Test post" });
      await post.save();
    });

    test("adds a comment to a post", async () => {
      const response = await request(app)
        .post(`/posts/${post._id}/comment`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Test comment" });

      expect(response.status).toEqual(200);
      expect(response.body.text).toEqual("Test comment");

      const updatedPost = await Post.findById(post._id);
      expect(updatedPost.comments.length).toEqual(1);
      expect(updatedPost.comments[0].text).toEqual("Test comment");
    });

    test("returns 404 for non-existent post", async () => {
      const invalidPostId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/posts/${invalidPostId}/comment`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Test comment" });

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Post not found");
    });

    test("returns 400 for empty comment text", async () => {
      const response = await request(app)
        .post(`/posts/${post._id}/comment`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "" });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Comment text is required");
    });

    test("returns 401 without token", async () => {
      const response = await request(app)
        .post(`/posts/${post._id}/comment`)
        .send({ text: "Test comment" });

      expect(response.status).toEqual(401);
    });
  });

  describe("POST /:postId/comments/:commentId/replies", () => {
    let user;
    let token;
    let post;
    let comment;

    beforeEach(async () => {
      user = new User(testUserData);
      await user.save();
      token = createToken(user._id.toString());
      post = new Post({ postedBy: user._id, text: "Test post" });
      comment = { commentedBy: user._id, text: "Test comment" };
      post.comments.push(comment);
      await post.save();
    });

    test("adds a reply to a comment", async () => {
      const response = await request(app)
        .post(`/posts/${post._id}/comments/${post.comments[0]._id}/replies`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Test reply" });

      expect(response.status).toEqual(200);
      expect(response.body.text).toEqual("Test reply");

      const updatedPost = await Post.findById(post._id);
      expect(updatedPost.comments[0].replies.length).toEqual(1);
      expect(updatedPost.comments[0].replies[0].text).toEqual("Test reply");
    });

    test("returns 404 for non-existent post", async () => {
      const invalidPostId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(
          `/posts/${invalidPostId}/comments/${post.comments[0]._id}/replies`
        )
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Test reply" });

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Post not found");
    });

    test("returns 404 for non-existent comment", async () => {
      const invalidCommentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/posts/${post._id}/comments/${invalidCommentId}/replies`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Test reply" });

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Comment not found");
    });

    test("returns 400 for empty reply text", async () => {
      const response = await request(app)
        .post(`/posts/${post._id}/comments/${post.comments[0]._id}/replies`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "" });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Reply text is required");
    });

    test("returns 401 without token", async () => {
      const response = await request(app)
        .post(`/posts/${post._id}/comments/${post.comments[0]._id}/replies`)
        .send({ text: "Test reply" });

      expect(response.status).toEqual(401);
    });
  });
});
