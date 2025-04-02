const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const Post = require("../../models/post");
const User = require("../../models/user");
const testUserData = require("../userDataForTest");
const { default: mongoose } = require("mongoose");

require("../mongodb_helper");

const secret = process.env.JWT_SECRET;

function createToken(userId) {
  return JWT.sign(
    {
      user_id: userId,
      // Backdate this token of 5 minutes
      iat: Math.floor(Date.now() / 1000) - 5 * 60,
      // Set the JWT token to expire in 10 minutes
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
  );
}

let token;
describe("/posts", () => {
  beforeAll(async () => {
    (testUserData.email = "post-test@test.com"),
      (testUserData.password = "12345678");
    const user = new User(testUserData);
    await user.save({ timeout: 5000 });
    await Post.deleteMany({});
    token = createToken(user.id);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  describe("POST, when a valid token is present", () => {
    test("responds with a 201", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Hello World!" });
      expect(response.status).toEqual(201);
    });

    test("creates a new post", async () => {
      await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Hello World!!" });

      const posts = await Post.find();
      expect(posts.length).toEqual(1);
      expect(posts[0].text).toEqual("Hello World!!");
    });

    test("returns a new token", async () => {
      const testApp = request(app);
      const response = await testApp
        .post("/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "hello world" });

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
    });
  });

  describe("POST, when token is missing", () => {
    test("responds with a 401", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ text: "hello again world" });

      expect(response.status).toEqual(401);
    });

    test("a post is not created", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ text: "hello again world" });

      const posts = await Post.find();
      expect(posts.length).toEqual(0);
    });

    test("a token is not returned", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ text: "hello again world" });

      expect(response.body.token).toEqual(undefined);
    });
  });

  describe("GET, when token is present", () => {
    test("the response code is 200", async () => {
      const post1 = new Post({ text: "I love all my children equally" });
      const post2 = new Post({ text: "I've never cared for GOB" });
      await post1.save();
      await post2.save();

      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });

    test("returns every post in the collection", async () => {
      const post1 = new Post({ text: "howdy!" });
      const post2 = new Post({ text: "hola!" });
      await post1.save();
      await post2.save();

      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`);

      const posts = response.body.posts;
      const firstPost = posts[0];
      const secondPost = posts[1];

      expect(firstPost.text).toEqual("howdy!");
      expect(secondPost.text).toEqual("hola!");
    });

    test("returns a new token", async () => {
      const post1 = new Post({ text: "First Post!" });
      const post2 = new Post({ text: "Second Post!" });
      await post1.save();
      await post2.save();

      const response = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${token}`);

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
    });
  });

  describe("GET, when token is missing", () => {
    test("the response code is 401", async () => {
      const post1 = new Post({ text: "howdy!" });
      const post2 = new Post({ text: "hola!" });
      await post1.save();
      await post2.save();

      const response = await request(app).get("/posts");

      expect(response.status).toEqual(401);
    });

    test("returns no posts", async () => {
      const post1 = new Post({ text: "howdy!" });
      const post2 = new Post({ text: "hola!" });
      await post1.save();
      await post2.save();

      const response = await request(app).get("/posts");

      expect(response.body.posts).toEqual(undefined);
    });

    test("does not return a new token", async () => {
      const post1 = new Post({ text: "howdy!" });
      const post2 = new Post({ text: "hola!" });
      await post1.save();
      await post2.save();

      const response = await request(app).get("/posts");

      expect(response.body.token).toEqual(undefined);
    });
  });

  // Tests for updating a post

  describe.only("PUT, when a valid token is present", () => {
    let token;
    let user;
    let post1; // Declare token variable to use in your tests

    beforeAll(async () => {
      // Create a user and generate a token before the tests run
      testUserData.email = "post-test@test.com";
      testUserData.password = "12345678";
      const user = new User(testUserData);
      await user.save({ timeout: 5000 });

      // Generate a token
      token = JWT.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

    post1 = new Post({
      postedBy: user._id,
      text: "I am an original post!",
    });

    // Save the post to the database
    await post1.save();
  });

    test("responds with a 200", async () => {
      const response = await request(app)
      .put(`/posts/${post1._id.toString()}`)  // Use the actual post's _id
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "I am an updated post!" });

      expect(response.status).toEqual(200);
    });

    test("updates an exisiting post", async () => {
      testUserData.email = "post-test@test.com";
      testUserData.password = "12345678";
      const user = new User(testUserData);
      await user.save({ timeout: 5000 });

      await request(app);
      const post1 = new Post({
        postedBy: user._id,
        text: "I am an original post!",
      });

      await post1.save();

      await request(app)
        .put(`/posts/${post1._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "I am an updated post!" });

      const posts = await Post.find();

      expect(posts.length).toEqual(1);
      expect(posts[0].text).toEqual("I am an updated post!");
    });

    test("returns a new token", async () => {
      testUserData.email = "post-test@test.com";
      testUserData.password = "12345678";
      const user = new User(testUserData);
      await user.save({ timeout: 5000 });

      const testApp = request(app);

      await request(app);
      const post1 = new Post({
        postedBy: user._id,
        text: "I am an original post!",
      });

      await post1.save();

      const response = await testApp
        .put(`/posts/${post1._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "I am an updated post!" });

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
    });
  });
});
