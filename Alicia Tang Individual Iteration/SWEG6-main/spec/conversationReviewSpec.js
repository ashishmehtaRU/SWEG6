const request = require("supertest");
const app = require("../Backend code/server");
const db = require("../Backend code/db");

describe("Iteration 2 Backend Routes", () => {
  let testUserId;
  let createdConversationId;
  let fetchSpy;

  beforeAll((done) => {
    db.serialize(() => {
      db.run("DELETE FROM messages");
      db.run("DELETE FROM conversations");
      db.run("DELETE FROM reviews");
      db.run("DELETE FROM users", [], () => {
        db.run(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          ["testuser", "test@example.com", "pass123"],
          function (err) {
            if (err) return done(err);
            testUserId = this.lastID;
            done();
          }
        );
      });
    });
  });

  beforeEach(() => {
    fetchSpy = spyOn(global, "fetch").and.callFake((url, options) => {
      if (url.includes("/api/generate")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            response: "Mock Ollama response"
          })
        });
      }
      return Promise.reject(new Error("Unexpected fetch call"));
    });
  });

  afterEach(() => {
    fetchSpy.calls.reset();
  });

  it("should create a conversation with a default model", (done) => {
    request(app)
      .post("/api/conversations")
      .send({ user_id: testUserId, title: "Test Chat" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toBe("conversation created");
        expect(res.body.conversationId).toBeDefined();
        expect(res.body.title).toBe("Test Chat");
        expect(res.body.model).toBeDefined();
        createdConversationId = res.body.conversationId;
        done();
      });
  });

  it("should reject conversation creation without user_id", (done) => {
    request(app)
      .post("/api/conversations")
      .send({ title: "No User Chat" })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("user_id required");
        done();
      });
  });

  it("should get conversations for a user", (done) => {
    request(app)
      .get(`/api/conversations/${testUserId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].user_id).toBe(testUserId);
        expect(res.body[0].title).toBeDefined();
        expect(res.body[0].model).toBeDefined();
        done();
      });
  });

  it("should search conversations by title or message content", (done) => {
    request(app)
      .get(`/api/conversations/search/${testUserId}?q=Test`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(Array.isArray(res.body)).toBeTrue();
        expect(res.body.length).toBeGreaterThan(0);
        done();
      });
  });

  it("should add a prompt and assistant response to a conversation", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/message`)
      .send({ prompt: "Hello" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toBe("response generated");
        expect(res.body.prompt).toBe("Hello");
        expect(res.body.response).toBe("Mock Ollama response");
        expect(res.body.model).toBeDefined();
        done();
      });
  });

  it("should reject adding a message with no prompt", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/message`)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("Prompt required");
        done();
      });
  });

  it("should return a conversation object and messages array", (done) => {
    request(app)
      .get(`/api/conversation/${createdConversationId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.conversation).toBeDefined();
        expect(res.body.messages).toBeDefined();
        expect(Array.isArray(res.body.messages)).toBeTrue();

        const roles = res.body.messages.map((m) => m.role);
        expect(roles).toContain("user");
        expect(roles).toContain("assistant");
        done();
      });
  });

  it("should return 404 for a missing conversation", (done) => {
    request(app)
      .get("/api/conversation/999999")
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("Conversation not found");
        done();
      });
  });

  it("should update the conversation model", (done) => {
    request(app)
      .patch(`/api/conversation/${createdConversationId}/model`)
      .send({ model: "llama3:8b", reset: false })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toBe("conversation model updated");
        expect(res.body.conversationId).toBe(createdConversationId);
        expect(res.body.model).toBe("llama3:8b");
        done();
      });
  });

  it("should reject model update without a model", (done) => {
    request(app)
      .patch(`/api/conversation/${createdConversationId}/model`)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("model required");
        done();
      });
  });

  it("should submit a review", (done) => {
    request(app)
      .post("/api/reviews")
      .send({
        user_id: testUserId,
        review_text: "Great app"
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toBe("review submitted");
        expect(res.body.review_text).toBe("Great app");
        done();
      });
  });

  it("should reject a blank review", (done) => {
    request(app)
      .post("/api/reviews")
      .send({
        user_id: testUserId,
        review_text: "   "
      })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("Review cannot be blank");
        done();
      });
  });

  it("should get reviews as a reviews array", (done) => {
    request(app)
      .get("/api/reviews")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.reviews).toBeDefined();
        expect(Array.isArray(res.body.reviews)).toBeTrue();
        expect(res.body.reviews.length).toBeGreaterThan(0);
        expect(res.body.reviews[0].review_text).toBeDefined();
        done();
      });
  });

  it("should run /llm/infer successfully", (done) => {
    request(app)
      .post("/api/llm/infer")
      .send({ prompt: "Say hello" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.output).toBe("Mock Ollama response");
        done();
      });
  });

  it("should reject /llm/infer without a prompt", (done) => {
    request(app)
      .post("/api/llm/infer")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("Prompt is required");
        done();
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