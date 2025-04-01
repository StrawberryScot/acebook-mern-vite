const request = require("supertest");

const app = require("../../app");
const User = require("../../models/user");
const testUserData = require("../userDataForTest");

require("../mongodb_helper");

describe("/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST, when email, password, first and last name are provided", () => {
    test("the response code is 201", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          email: testUserData.email,
          password: testUserData.password,
          firstName: testUserData.firstName,
          lastName: testUserData.lastName,
        });

      expect(response.statusCode).toBe(201);
    });

    test("a user is created", async () => {
      await request(app)
        .post("/users")
        .send({
          email: testUserData.email,
          password: testUserData.password,
          firstName: testUserData.firstName,
          lastName: testUserData.lastName,
        });

      const users = await User.find();
      const newUser = users[users.length - 1];
      expect(newUser.email).toEqual("someone@example.com");
    });
  });

  describe("POST, when password is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({
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
      const response = await request(app)
        .post("/users")
        .send({
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
      const response = await request(app)
        .post("/users")
        .send({
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
      const response = await request(app)
        .post("/users")
        .send({
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
});
