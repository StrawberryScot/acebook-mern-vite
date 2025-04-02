const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const Post = require("../../models/post");
const User = require("../../models/user");
const testUserData = require("../userDataForTest");

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

  beforeAll(async () => {
    try {
      console.log("Creating test user with data:", testUserData);
      user = new User(testUserData);
      await user.save({ timeout: 5000 });
      console.log("User saved with ID:", user._id);
      token = createToken(user._id.toString());
      console.log("Token generated:", token);
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  afterEach(async () => {
    await Post.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
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

    test("rejects if postedBy doesn’t match token user", async () => {
      const otherUser = new User({ email: "other@example.com", password: "pass", firstName: "Other", lastName: "User" });
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
      expect(response.body.error).toEqual("Text must be less than 500 characters");
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
});