const request = require("supertest");
const express = require("express");
const routes = require("../routes");

describe("Conversation prompt API", function () {
  let app;

  beforeAll(function () {
    app = express();
    app.use(express.json());
    app.use("/api", routes);
  });

  // new
  it("should store a user prompt with /api/conversation/:conversationId/prompt", async function () {
    const createRes = await request(app).post("/api/conversations").send({
      user_id: 1,
      title: "Unit test conversation",
      model: "llama3:8b",
    });

    expect(createRes.statusCode).toBe(200);
    expect(createRes.body.conversationId).toBeDefined();

    const conversationId = createRes.body.conversationId;
    const promptRes = await request(app)
      .post(`/api/conversation/${conversationId}/prompt`)
      .send({ prompt: "Unit test prompt" });

    expect(promptRes.statusCode).toBe(200);
    expect(promptRes.body).toEqual({
      message: "prompt stored",
      conversationId,
    });
  });

  // new
  it("should save a selected assistant response and update the conversation model", async function () {
    const createRes = await request(app).post("/api/conversations").send({
      user_id: 1,
      title: "Assistant preference test",
      model: "llama3:8b",
    });

    expect(createRes.statusCode).toBe(200);
    const conversationId = createRes.body.conversationId;

    const assistantRes = await request(app)
      .post(`/api/conversation/${conversationId}/assistant`)
      .send({
        model: "gemma3:4b",
        content: "Preferred assistant response.",
      });

    expect(assistantRes.statusCode).toBe(200);
    expect(assistantRes.body).toEqual({
      message: "assistant response saved",
      conversationId,
      model: "gemma3:4b",
    });

    const fetchRes = await request(app).get(
      `/api/conversation/${conversationId}`,
    );
    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.body.conversation.model).toBe("gemma3:4b");
    expect(
      fetchRes.body.messages.some((msg) =>
        msg.content.includes("[gemma3:4b] Preferred assistant response."),
      ),
    ).toBe(true);
  });
});
