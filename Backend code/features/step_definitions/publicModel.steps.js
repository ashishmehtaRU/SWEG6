const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("the public model API is failing", async function () {
  this.publicModelFailure = true;
});

Then("the request should be routed to {string}", async function (model) {
  assert.strictEqual(this.selectedModel, model);
});

Then("I should see an API failure message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("api") ||
      body.toLowerCase().includes("error") ||
      body.toLowerCase().includes("failed") ||
      body.toLowerCase().includes("unavailable") ||
      body.includes("Unable to generate response"),
    "Expected API failure message",
  );
});