const request = require("supertest");
const express = require("express");
const routes = require("../routes");

describe("Multi-LLM API", () => {
  let app;
  let fetchSpy;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api", routes);
  });

  beforeEach(() => {
    fetchSpy = spyOn(global, "fetch").and.callFake((_url, options) => {
      const body = JSON.parse(options.body);

      return Promise.resolve({
        ok: true,
        json: async () => ({
          response: `Mock response from ${body.model}`,
        }),
      });
    });
  });

  afterEach(() => {
    fetchSpy.calls.reset();
  });

  it("should return available local models", (done) => {
    request(app)
      .get("/api/llm/models")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.models).toBeDefined();
        expect(Array.isArray(res.body.models)).toBeTrue();
        expect(res.body.models.length).toBeGreaterThan(1);
        expect(res.body.models[0].id).toBeDefined();

        done();
      });
  });

  it("should reject multi-infer without a prompt", (done) => {
    request(app)
      .post("/api/llm/multi-infer")
      .send({ models: ["llama3.2:3b", "llama3.2:1b"] })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.error).toBe("Prompt is required");

        done();
      });
  });

  it("should generate multiple model responses", (done) => {
    request(app)
      .post("/api/llm/multi-infer")
      .send({
        prompt: "Say hello",
        models: ["llama3.2:3b", "llama3.2:1b"],
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.prompt).toBe("Say hello");
        expect(res.body.results).toBeDefined();
        expect(Array.isArray(res.body.results)).toBeTrue();
        expect(res.body.results.length).toBe(2);
        expect(res.body.results[0].output).toContain("Mock response");

        done();
      });
  });
});