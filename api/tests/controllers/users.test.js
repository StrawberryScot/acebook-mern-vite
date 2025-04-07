const request = require("supertest");

const app = require("../../app");
const User = require("../../models/user");
const testUserData = require("../userDataForTest");

require("../mongodb_helper");

describe("/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST, when email and password are provided", () => {
    test("the response code is 400 when password is not longer than 8 char", async () => {
      const response = await request(app).post("/users").send({
        email: testUserData.email,
        password: "1234",
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual(
        "Password must be at least 8 characters long"
      );
    });

    test("the response code is 400 when password has no special char", async () => {
      const response = await request(app).post("/users").send({
        email: testUserData.email,
        password: "123456789",
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual(
        "Password must contain at least one special character"
      );
    });

    test("the response code is 400 when using invalid email", async () => {
      const response = await request(app).post("/users").send({
        email: "Johniscool.com",
        password: "!123456789",
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual("Invalid email format");
    });

    test("the response code is 400 and we get email is required messaage", async () => {
      const response = await request(app).post("/users").send({
        email: "",
        password: "!123456789",
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual("Email is required");
    });

    test("returns status 400 when database save fails", async () => {
      // Mock the User model's save method to throw an error
      jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
        return Promise.reject(new Error("Database connection error"));
      });

      const response = await request(app).post("/users").send({
        email: "valid@email.com",
        password: "valid!password123",
        firstName: "John",
        lastName: "Doe",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual("Something went wrong");

      // Restore the original implementation
      User.prototype.save.mockRestore();
    });

    test("the response code is 201 when password is longer than 8 char and has a special char", async () => {
      const response = await request(app).post("/users").send({
        email: "poppy@email.com",
        password: "!123456789",
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(201);
      const users = await User.find();
      const newUser = users[users.length - 1];
      expect(newUser.email).toEqual("poppy@email.com");
    });
  });

  describe("POST, when password is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app).post("/users").send({
        email: testUserData.email,
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({
        email: testUserData.email,
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when email is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app).post("/users").send({
        password: testUserData.password,
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({
        password: testUserData.password,
        firstName: testUserData.firstName,
        lastName: testUserData.lastName,
      });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when first name is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app).post("/users").send({
        email: testUserData.email,
        password: testUserData.password,
        lastName: testUserData.lastName,
      });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({
        email: testUserData.email,
        password: testUserData.password,
        lastName: testUserData.lastName,
      });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when last name is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app).post("/users").send({
        email: testUserData.email,
        password: testUserData.password,
        firstName: testUserData.firstName,
      });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({
        email: testUserData.email,
        password: testUserData.password,
        firstName: testUserData.firstName,
      });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  // tests for getting user name from ID

  describe("GET, users name from user ID provided", () => {
    test("response code is 200", async () => {
      const coolUser = await User.create({
        email: "someone@example.com",
        password: "password",
        firstName: "Some",
        lastName: "One",
        profilePicPath: "test-address",
        status: "Online",
        backgroundPicPath: "test-back-address",
        isOnlyFriends: false,
      });
      const response = await request(app).get(`/users/${coolUser._id}`);
      console.log("Test user ID:", coolUser._id);


      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        firstName: "Some",
        lastName: "One",
      });
    });
    test("it returns 404 for a non-existing user", async () => {
      const fakeId = "0000a9c8902d41b7360e9693";
      const response = await request(app).get(`/users/${fakeId}`);
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual("User does NOT exist!");
    });
  });
});
