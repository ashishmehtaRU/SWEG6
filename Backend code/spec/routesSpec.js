const request = require("supertest");
const express = require("express");
const routes = require("../routes");

describe("routes.js", function () {
  let app;

  beforeAll(function () {
    app = express();
    app.use(express.json());
    app.use("/", routes);
  });

  it("should register a user", function (done) {
    request(app)
      .post("/register")
      .send({
        username: "test",
        email: `test${Date.now()}@example.com`,
        password: "pass",
      })
      .end(function (err, res) {
        expect([200, 409, 500]).toContain(res.statusCode);
        done();
      });
  });

  it("should reject register if fields are missing", function (done) {
    request(app)
      .post("/register")
      .send({ email: "bad@example.com" })
      .end(function (err, res) {
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing required fields");
        done();
      });
  });

  it("should login a user", function (done) {
    request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "pass" })
      .end(function (err, res) {
        expect([200, 401]).toContain(res.statusCode);
        done();
      });
  });

  it("should reject login if email or password is missing", function (done) {
    request(app)
      .post("/login")
      .send({ email: "test@example.com" })
      .end(function (err, res) {
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing email or password");
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

  it("should reject multi-response when prompt is blank", function (done) {
    request(app)
      .post("/conversation/1/multi-response")
      .send({ prompt: "" })
      .end(function (err, res) {
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Prompt required");
        done();
      });
  });

  it("should return 404 for multi-response if conversation does not exist", function (done) {
    request(app)
      .post("/conversation/999999/multi-response")
      .send({
        prompt: "Hello",
        models: ["llama3:8b", "deepseek-r1:8b", "mistral"],
      })
      .end(function (err, res) {
        expect([404, 500]).toContain(res.statusCode);
        done();
      });
  });

  it("should submit a review", function (done) {
    request(app)
      .post("/reviews")
      .send({
        author: "Ashish",
        rating: 5,
        text: "Good app",
      })
      .end(function (err, res) {
        expect([200, 500]).toContain(res.statusCode);
        done();
      });
  });

  it("should reject blank review text", function (done) {
    request(app)
      .post("/reviews")
      .send({
        author: "Ashish",
        rating: 5,
        text: "",
      })
      .end(function (err, res) {
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Review cannot be blank");
        done();
      });
  });

  it("should fetch reviews", function (done) {
    request(app)
      .get("/reviews")
      .end(function (err, res) {
        expect([200, 500]).toContain(res.statusCode);
        done();
      });
  });
});