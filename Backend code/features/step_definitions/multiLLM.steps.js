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

Given("the public model API is failing", async function () {
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
          error: "Gemini API error: mocked failure",
        }),
      });
      return;
    }
    request.continue();
  });
});

Then("the request should be routed to {string}", async function (model) {
  assert.strictEqual(this.selectedModel, model);
});

Then("I should see an API failure message", async function () {
  await this.page.waitForFunction(() => {
    return !!window.__lastAlert;
  }, { timeout: 10000 });

  const msg = await this.page.evaluate(() => window.__lastAlert || "");
  assert.ok(
    msg.toLowerCase().includes("error") ||
      msg.toLowerCase().includes("failed") ||
      msg.toLowerCase().includes("connection error"),
    `Expected API failure alert, got: ${msg}`
  );
});