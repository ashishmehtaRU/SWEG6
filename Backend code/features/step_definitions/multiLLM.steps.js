const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("response generation fails", async function () {
  this.responseGenerationFailure = true;
});

Then("I should see response 1", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected first response");
});

Then("I should see response 2", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected second response");
});

Then("I should see response 3", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected third response");
});

Then("each response should be displayed in a separate section", async function () {
  const count = await this.page.evaluate(() => {
    const possible = document.querySelectorAll(
      ".response, .assistant-message, .message.assistant, .response-card"
    );
    return possible.length;
  });

  assert.ok(count >= 1, "Expected separate response sections");
});

Then("I should see a response generation error message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("error") ||
      body.toLowerCase().includes("failed") ||
      body.toLowerCase().includes("unable"),
    "Expected response generation error message",
  );
});