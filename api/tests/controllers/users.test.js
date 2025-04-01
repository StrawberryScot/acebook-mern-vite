const request = require("supertest");

const app = require("../../app");
const User = require("../../models/user");

require("../mongodb_helper");

describe("/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST, when email and password are provided", () => {
    test("the response code is 400 when password is not longer than 8 char", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "poppy@email.com", password: "1234" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual(
        "Password must be at least 8 characters long"
      );
    });

    test("the response code is 400 when password has no special char", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "poppy@email.com", password: "123456789" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual(
        "Password must contain at least one special character"
      );
    });

    test("the response code is 400 when using invalid email", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "johniscool.com", password: "!123456789" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual("Invalid email format");
    });

    test("the response code is 400 and we get email is required messaage", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "", password: "!123456789" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual("Email is required");
    });

    test("returns status 400 when database save fails", async () => {
      // Mock the User model's save method to throw an error
      jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
        return Promise.reject(new Error("Database connection error"));
      });

      const response = await request(app)
        .post("/users")
        .send({
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
      const response = await request(app)
        .post("/users")
        .send({ email: "poppy@email.com", password: "12345678!" });

      expect(response.statusCode).toBe(201);
    });

    test("a user is created with a valid password", async () => {
      await request(app)
        .post("/users")
        .send({ email: "scarconstt@email.com", password: "123445678!" });

      const users = await User.find();
      const newUser = users[users.length - 1];
      expect(newUser.email).toEqual("scarconstt@email.com");
    });
  });

  describe("POST, when password is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "skye@email.com" });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({ email: "skye@email.com" });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when email is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({ password: "1234" });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({ password: "1234" });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });
});
