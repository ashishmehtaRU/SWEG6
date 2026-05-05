const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

async function stubAlert(page) {
  await page.evaluate(() => {
    window.__lastAlert = null;
    window.alert = (msg) => {
      window.__lastAlert = String(msg);
    };
  });
}

Given("the local model server is offline", async function () {
  await stubAlert(this.page);

  await this.page.setRequestInterception(true);

  this.page.removeAllListeners("request");
  this.page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().includes("/api/conversation/") &&
      request.url().includes("/message")
    ) {
      request.respond({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Failed to connect to Ollama. Make sure Ollama is running.",
        }),
      });
      return;
    }
    request.continue();
  });
});

Then("I should see a local model option in the model selection list", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.includes("Llama") ||
      body.includes("Gemma") ||
      body.includes("Qwen"),
    "Expected a local model option in the model selection list",
  );
});

Then("the request should be routed to the local model server", async function () {
  assert.ok(this.selectedModel, "Expected a selected model");
  const localModels = ["llama3:8b", "gemma3:4b", "qwen3.5:4b"];
  assert.ok(
    localModels.includes(this.selectedModel),
    `Expected local model routing, got "${this.selectedModel}"`,
  );
});

Then("the request should use {string}", async function (model) {
  assert.strictEqual(this.selectedModel, model);
});

Then("I should see a local model error message", async function () {
  await this.page.waitForFunction(() => {
    return !!window.__lastAlert;
  }, { timeout: 10000 });

  const msg = await this.page.evaluate(() => window.__lastAlert || "");
  assert.ok(
    msg.toLowerCase().includes("connection error") ||
      msg.toLowerCase().includes("failed") ||
      msg.toLowerCase().includes("ollama"),
    `Expected local model error alert, got: ${msg}`
  );
});