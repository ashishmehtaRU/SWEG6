const request = require("supertest");
const express = require("express");

const router = require("../Backend code/routes");
const db = require("../Backend code/db");

describe("Iteration 2 Backend Routes", () => {
  let app;
  let conversationAId;
  let conversationBId;

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
          done,
        );
      });
    });
  });

  it("should create two conversations for the same user", (done) => {
    request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat", model: "llama3:8b" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe("conversation created");
        expect(res.body.conversationId).toBeDefined();
        conversationAId = res.body.conversationId;

        request(app)
          .post("/api/conversations")
          .send({ user_id: 1, title: "Second Chat", model: "gpt-4" })
          .expect(200)
          .end((err2, secondRes) => {
            expect(secondRes.body.message).toBe("conversation created");
            expect(secondRes.body.conversationId).toBeDefined();
            conversationBId = secondRes.body.conversationId;
            done(err || err2);
          });
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

  it("should list conversations for a user", (done) => {
    request(app)
      .get("/api/conversations/1")
      .expect(200)
      .end((err, res) => {
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBe(2);
        expect(res.body.some((c) => c.title === "Test Chat")).toBeTrue();
        expect(res.body.some((c) => c.title === "Second Chat")).toBeTrue();
        done(err);
      });
  });

  it("should add a prompt and AI response to the first conversation", (done) => {
    request(app)
      .post(`/api/conversation/${conversationAId}/message`)
      .send({ prompt: "Hello" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe("response generated");
        expect(res.body.prompt).toBe("Hello");
        expect(res.body.response).toBeDefined();
        expect(res.body.model).toBe("llama3:8b");
        done(err);
      });
  });

  it("should reject adding a message with no prompt", (done) => {
    request(app)
      .post(`/api/conversation/${conversationAId}/message`)
      .send({})
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).toBe("Prompt required");
        done(err);
      });
  });

  it("should return conversation details and history", (done) => {
    request(app)
      .get(`/api/conversation/${conversationAId}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.conversation).toBeDefined();
        expect(res.body.conversation.id).toBe(conversationAId);
        expect(Array.isArray(res.body.messages)).toBeTrue();
        expect(res.body.messages.length).toBeGreaterThan(0);

        const roles = res.body.messages.map((m) => m.role);
        expect(roles).toContain("user");
        expect(roles).toContain("assistant");
        done(err);
      });
  });

  it("should switch LLM model and clear history for the conversation", (done) => {
    request(app)
      .patch(`/api/conversation/${conversationAId}/model`)
      .send({ model: "gpt-4", reset: true })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe("conversation model updated");
        expect(res.body.model).toBe("gpt-4");
        expect(res.body.reset).toBeTrue();
        done(err);
      });
  });

  it("should return an empty history after switching model with reset", (done) => {
    request(app)
      .get(`/api/conversation/${conversationAId}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.conversation).toBeDefined();
        expect(Array.isArray(res.body.messages)).toBeTrue();
        expect(res.body.messages.length).toBe(0);
        done(err);
      });
  });

  it("should add a new prompt after model switch and keep the updated model", (done) => {
    request(app)
      .post(`/api/conversation/${conversationAId}/message`)
      .send({ prompt: "Tell me a joke" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.model).toBe("gpt-4");
        expect(res.body.response).toBeDefined();
        done(err);
      });
  });

  it("should search conversations by title or message content", (done) => {
    request(app)
      .get("/api/conversations/search/1?q=Second")
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
        review_text: "Great app",
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
        review_text: "   ",
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
        expect(Array.isArray(res.body.reviews)).toBeTrue();
        expect(res.body.reviews.length).toBeGreaterThan(0);
        expect(res.body.reviews[0].review_text).toBeDefined();
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
