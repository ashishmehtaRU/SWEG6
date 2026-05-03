const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("the local model server is offline", async function () {
  this.localModelOffline = true;
});

Then("the request should be routed to the local model server", async function () {
  assert.ok(this.selectedModel, "Expected a selected model");
  const localModels = ["llama3.2:3b", "gemma3:4b", "qwen3:0.6b", "Ollama"];
  assert.ok(
    localModels.some((m) => this.selectedModel.includes(m) || m.includes(this.selectedModel)),
    `Expected local model routing, got "${this.selectedModel}"`,
  );
});

Then("the request should use {string}", async function (model) {
  assert.strictEqual(this.selectedModel, model);
});

Then("I should see a local model error message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("error") ||
      body.toLowerCase().includes("failed") ||
      body.toLowerCase().includes("unavailable") ||
      body.includes("Unable to generate response"),
    "Expected local model error message",
  );
});