const request = require("supertest");
const app = require("../app");
require("./mongodb_helper");

describe("Express error handling", () => {
  test("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ err: "Error 404: Not Found" });
  });

  test("should return 500 and error message in development mode", async () => {
    process.env.NODE_ENV = "development";
    const res = await request(app).get("/error");
    expect(res.status).toBe(500);
    expect(res.text).toBe("Test error");
  });

  test("should return generic error message in production mode", async () => {
    process.env.NODE_ENV = "production";
    const res = await request(app).get("/error");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ err: "Something went wrong" });
  });
});
