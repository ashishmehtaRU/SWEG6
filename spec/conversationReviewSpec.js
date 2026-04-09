const request = require("supertest");
const express = require("express");

const router = require("../Backend code/routes");
const db = require("../Backend code/db");

describe("Iteration 2 Backend Routes", () => {
  let app;
  let createdConversationId;

  beforeAll((done) => {
    app = express();
    app.use(express.json());
    app.use("/api", router);

    db.serialize(() => {
      db.run("DELETE FROM messages");
      db.run("DELETE FROM conversations");
      db.run("DELETE FROM reviews");
      db.run("DELETE FROM users", [], () => {
        db.run(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          ["testuser", "test@example.com", "pass123"],
          done
        );
      });
    });
  });

  it("should create a conversation", (done) => {
    request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe("conversation created");
        expect(res.body.conversationId).toBeDefined();
        createdConversationId = res.body.conversationId;
        done(err);
      });
  });

  it("should reject conversation creation without user_id", (done) => {
    request(app)
      .post("/api/conversations")
      .send({ title: "No User Chat" })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).toBe("user_id required");
        done(err);
      });
  });

  it("should get conversations for a user", (done) => {
    request(app)
      .get("/api/conversations/1")
      .expect(200)
      .end((err, res) => {
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].user_id).toBe(1);
        done(err);
      });
  });

  it("should add a prompt and AI response to a conversation", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/message`)
      .send({ prompt: "Hello" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe("response generated");
        expect(res.body.prompt).toBe("Hello");
        expect(res.body.response).toBeDefined();
        done(err);
      });
  });

  it("should reject adding a message with no prompt", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/message`)
      .send({})
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).toBe("Prompt required");
        done(err);
      });
  });

  it("should get messages for a conversation", (done) => {
    request(app)
      .get(`/api/conversation/${createdConversationId}`)
      .expect(200)
      .end((err, res) => {
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBeGreaterThan(0);

        const roles = res.body.map((m) => m.role);
        expect(roles).toContain("user");
        expect(roles).toContain("assistant");
        done(err);
      });
  });

  it("should search conversations by title or message content", (done) => {
    request(app)
      .get("/api/conversations/search/1?q=Test")
      .expect(200)
      .end((err, res) => {
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBeGreaterThan(0);
        done(err);
      });
  });

  it("should submit a review", (done) => {
    request(app)
      .post("/api/reviews")
      .send({
        user_id: 1,
        review_text: "Great app"
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe("review submitted");
        done(err);
      });
  });

  it("should reject a blank review", (done) => {
    request(app)
      .post("/api/reviews")
      .send({
        user_id: 1,
        review_text: "   "
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).toBe("Review cannot be blank");
        done(err);
      });
  });

  it("should get reviews", (done) => {
    request(app)
      .get("/api/reviews")
      .expect(200)
      .end((err, res) => {
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].review_text).toBeDefined();
        done(err);
      });
  });

  afterAll((done) => {
    db.serialize(() => {
      db.run("DELETE FROM messages");
      db.run("DELETE FROM conversations");
      db.run("DELETE FROM reviews");
      db.run("DELETE FROM users", done);
    });
  });
});