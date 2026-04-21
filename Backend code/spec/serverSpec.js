const request = require("supertest");
const express = require("express");
const routes = require("../routes");

describe("server.js", function () {
  let app;

  beforeAll(function () {
    app = express();
    app.use(express.json());
    app.use("/api", routes);
  });

  it("should respond to /api/logout", function (done) {
    request(app)
      .post("/api/logout")
      .end(function (err, res) {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("logout");
        done();
      });
  });

  it("should respond to /api/reviews", function (done) {
    request(app)
      .get("/api/reviews")
      .end(function (err, res) {
        expect([200, 500]).toContain(res.statusCode);
        done();
      });
  });
});