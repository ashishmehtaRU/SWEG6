const request = require("supertest");
const app = require("../server");
const db = require("../db");

describe("Individual Iteration Multi-LLM Routes", () => {
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
          },
        );
      });
    });
  });

  beforeEach(() => {
    let callCount = 0;

    fetchSpy = spyOn(global, "fetch").and.callFake((url, options) => {
      if (url.includes("/api/generate")) {
        callCount += 1;

        const mockResponses = [
          { response: "Short answer from model 1" },
          {
            response:
              "This is a longer and more complete answer from model 2, so it should likely be chosen as the recommended response.",
          },
          { response: "Alternative answer from model 3" },
        ];

        return Promise.resolve({
          ok: true,
          json: async () => mockResponses[(callCount - 1) % 3],
        });
      }

      return Promise.reject(new Error("Unexpected fetch call"));
    });
  });

  afterEach(() => {
    fetchSpy.calls.reset();
  });

  it("should create a conversation", (done) => {
    request(app)
      .post("/api/conversations")
      .send({ user_id: testUserId, title: "Multi LLM Chat" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toBe("conversation created");
        expect(res.body.conversationId).toBeDefined();
        createdConversationId = res.body.conversationId;
        done();
      });
  });

  it("should generate 3 responses for one prompt", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/multi-response`)
      .send({
        prompt: "Explain recursion simply",
        models: ["llama3:8b", "deepseek-r1:8b", "mistral"],
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.message).toBe("responses generated");
        expect(res.body.prompt).toBe("Explain recursion simply");
        expect(Array.isArray(res.body.responses)).toBeTrue();
        expect(res.body.responses.length).toBe(3);

        expect(res.body.responses[0].model).toBeDefined();
        expect(res.body.responses[1].model).toBeDefined();
        expect(res.body.responses[2].model).toBeDefined();

        done();
      });
  });

  it("should mark one response as recommended", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/multi-response`)
      .send({
        prompt: "What is an operating system?",
        models: ["llama3:8b", "deepseek-r1:8b", "mistral"],
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        const recommendedResponses = res.body.responses.filter(
          (r) => r.recommended === true,
        );

        expect(recommendedResponses.length).toBe(1);
        expect(res.body.recommendedIndex).toBeDefined();
        done();
      });
  });

  it("should reject multi-response without a prompt", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/multi-response`)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("Prompt required");
        done();
      });
  });

  it("should return 404 for a missing conversation in multi-response", (done) => {
    request(app)
      .post("/api/conversation/999999/multi-response")
      .send({
        prompt: "Hello",
        models: ["llama3:8b", "deepseek-r1:8b", "mistral"],
      })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe("Conversation not found");
        done();
      });
  });

  it("should regenerate responses for the same prompt", (done) => {
    request(app)
      .post(`/api/conversation/${createdConversationId}/multi-response`)
      .send({
        prompt: "Describe cloud computing",
        models: ["llama3:8b", "deepseek-r1:8b", "mistral"],
        regenerate: true,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.message).toBe("responses regenerated");
        expect(Array.isArray(res.body.responses)).toBeTrue();
        expect(res.body.responses.length).toBe(3);
        done();
      });
  });

  it("should store multi-response messages in the conversation history", (done) => {
    request(app)
      .get(`/api/conversation/${createdConversationId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.conversation).toBeDefined();
        expect(Array.isArray(res.body.messages)).toBeTrue();

        const userMessages = res.body.messages.filter((m) => m.role === "user");
        const assistantMessages = res.body.messages.filter(
          (m) => m.role === "assistant",
        );

        expect(userMessages.length).toBeGreaterThan(0);
        expect(assistantMessages.length).toBeGreaterThan(0);

        const recommendedMessages = assistantMessages.filter(
          (m) => m.is_recommended === 1,
        );
        expect(recommendedMessages.length).toBeGreaterThan(0);

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