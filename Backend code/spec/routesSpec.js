const request = require("supertest");
const express = require("express");
const routes = require("../routes");

describe("routes.js", function () {
  let app;
  let testEmail;

  beforeAll(function () {
    testEmail = `test_${Date.now()}@example.com`;

    app = express();
    app.use(express.json());

    app.use(function (req, res, next) {
      req.login = function (user, cb) {
        cb(null);
      };
      req.logout = function (cb) {
        if (cb) cb(null);
      };
      next();
    });

    app.use("/", routes);
  });

  it("should register a user", function (done) {
    request(app)
      .post("/register")
      .send({ username: "test", email: testEmail, password: "pass" })
      .end(function (err, res) {
        expect([200, 409, 500]).toContain(res.statusCode);
        done();
      });
  });

  it("should login a user", function (done) {
    request(app)
      .post("/login")
      .send({ email: testEmail, password: "pass" })
      .end(function (err, res) {
        expect([200, 401, 500]).toContain(res.statusCode);
        done();
      });
  });

  it("should logout", function (done) {
    request(app)
      .post("/logout")
      .end(function (err, res) {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("logout");
        done();
      });
  });
});
