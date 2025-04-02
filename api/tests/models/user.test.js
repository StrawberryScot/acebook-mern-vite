require("../mongodb_helper");
const testUserData = require("../userDataForTest");
const User = require("../../models/user");
const bcrypt = require("bcrypt");

describe("User model", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("has an email address", () => {
    const user = new User(testUserData);
    expect(user.email).toEqual("someone@example.com");
  });

  it("has a first name", () => {
    const user = new User(testUserData);
    expect(user.firstName).toEqual("Some");
  });

  it("has a last name", () => {
    const user = new User(testUserData);
    expect(user.lastName).toEqual("One");
  });

  it("has a profile picture path", () => {
    const user = new User(testUserData);
    expect(user.profilePicPath).toEqual("test-address");
  });

  it("has an empty friends list", () => {
    const user = new User(testUserData);
    expect(user.friends).toEqual([]);
  });

  it("has a status of online", () => {
    const user = new User(testUserData);
    expect(user.status).toEqual("Online");
  });

  it("has a background picture path", () => {
    const user = new User(testUserData);
    expect(user.backgroundPicPath).toEqual("test-back-address");
  });

  it("has a boolean isOnlyFriends set to true", () => {
    const user = new User(testUserData);
    expect(user.isOnlyFriends).toEqual(false);
  });

  it("has a password", () => {
    const user = new User(testUserData);
    expect(user.password).toEqual("password");
  });

  it("can list all users", async () => {
    const users = await User.find();
    expect(users).toEqual([]);
  });

  it("can save a user", async () => {
    const user = new User(testUserData);

    await user.save();
    const users = await User.find();
    const originalPassword = "password";
    const isMatch = await bcrypt.compare(originalPassword, users[0].password);
    expect(isMatch).toBeTruthy();

    expect(users[0].email).toEqual("someone@example.com");

    expect(users[0].firstName).toEqual("Some");
    expect(users[0].lastName).toEqual("One");
  });
});
