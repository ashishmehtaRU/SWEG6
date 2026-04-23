const request = require("supertest");
const express = require("express");
const routes = require("../routes");

describe("Conversation and Review API", function () {
  let app;
  let fetchSpy;

  beforeAll(function () {
    app = express();
    app.use(express.json());
    app.use("/api", routes);
  });

  beforeEach(() => {
    fetchSpy = spyOn(global, "fetch").and.callFake((url, options) => {
      if (url.includes("/api/generate")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            response: "Mock Ollama response",
          }),
        });
      }
      return Promise.reject(new Error("Unexpected fetch call"));
    });
  });

  afterEach(() => {
    fetchSpy.calls.reset();
  });

  it("should create a conversation with a default model", async function () {
    const res = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("conversation created");
    expect(res.body.conversationId).toBeDefined();
    expect(res.body.title).toBe("Test Chat");
    expect(res.body.model).toBeDefined();
  });

  it("should reject conversation creation without user_id", async function () {
    const res = await request(app)
      .post("/api/conversations")
      .send({ title: "No User Chat" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("user_id required");
  });

  it("should get conversations for a user", async function () {
    // First create a conversation
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);

    const res = await request(app).get("/api/conversations/1");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].user_id).toBe(1);
    expect(res.body[0].title).toBeDefined();
    expect(res.body[0].model).toBeDefined();
  });

  it("should search conversations by title or message content", async function () {
    const res = await request(app).get("/api/conversations/search/1?q=Test");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
  });

  it("should add a prompt and assistant response to a conversation", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const res = await request(app)
      .post(`/api/conversation/${conversationId}/message`)
      .send({ prompt: "Hello" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("response generated");
    expect(res.body.prompt).toBe("Hello");
    expect(res.body.response).toBe("Mock Ollama response");
    expect(res.body.model).toBeDefined();
  });

  it("should store a prompt only for comparison rounds", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const res = await request(app)
      .post(`/api/conversation/${conversationId}/prompt`)
      .send({ prompt: "Compare this" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("prompt stored");
    expect(res.body.conversationId).toBe(conversationId);
  });

  it("should save a selected assistant response and update the conversation model", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const res = await request(app)
      .post(`/api/conversation/${conversationId}/assistant`)
      .send({ model: "gemma3:4b", content: "Selected output" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("assistant response saved");
    expect(res.body.conversationId).toBe(conversationId);
    expect(res.body.model).toBe("gemma3:4b");
  });

  it("should reject adding a message with no prompt", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const res = await request(app)
      .post(`/api/conversation/${conversationId}/message`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Prompt required");
  });

  it("should return a conversation object and messages array", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    // Add a message first
    await request(app)
      .post(`/api/conversation/${conversationId}/message`)
      .send({ prompt: "Hello" });

    const res = await request(app).get(`/api/conversation/${conversationId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.conversation).toBeDefined();
    expect(res.body.messages).toBeDefined();
    expect(Array.isArray(res.body.messages)).toBeTrue();

    const roles = res.body.messages.map((m) => m.role);
    expect(roles).toContain("user");
    expect(roles).toContain("assistant");
  });

  it("should return 404 for a missing conversation", async function () {
    const res = await request(app).get("/api/conversation/999999");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Conversation not found");
  });

  it("should update the conversation model", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const res = await request(app)
      .patch(`/api/conversation/${conversationId}/model`)
      .send({ model: "llama3:8b", reset: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("conversation model updated");
    expect(res.body.conversationId).toBe(conversationId);
    expect(res.body.model).toBe("llama3:8b");
  });

  it("should reject model update without a model", async function () {
    const createRes = await request(app)
      .post("/api/conversations")
      .send({ user_id: 1, title: "Test Chat" });
    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const res = await request(app)
      .patch(`/api/conversation/${conversationId}/model`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("model required");
  });

  it("should submit a review", async function () {
    const res = await request(app).post("/api/reviews").send({
      user_id: 1,
      review_text: "Great app",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("review submitted");
    expect(res.body.review_text).toBe("Great app");
  });

  it("should reject a blank review", async function () {
    const res = await request(app).post("/api/reviews").send({
      user_id: 1,
      review_text: "   ",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Review cannot be blank");
  });

  it("should get reviews as a reviews array", async function () {
    // Submit a review first
    await request(app).post("/api/reviews").send({
      user_id: 1,
      review_text: "Great app",
    });

    const res = await request(app).get("/api/reviews");

    expect(res.statusCode).toBe(200);
    expect(res.body.reviews).toBeDefined();
    expect(Array.isArray(res.body.reviews)).toBeTrue();
    expect(res.body.reviews.length).toBeGreaterThan(0);
    expect(res.body.reviews[0].review_text).toBeDefined();
  });

  it("should run /llm/infer successfully", async function () {
    const res = await request(app)
      .post("/api/llm/infer")
      .send({ prompt: "Say hello" });

    expect(res.statusCode).toBe(200);
    expect(res.body.output).toBe("Mock Ollama response");
  });

  it("should reject /llm/infer without a prompt", async function () {
    const res = await request(app).post("/api/llm/infer").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Prompt is required");
  });
});
