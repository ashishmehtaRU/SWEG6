const { Then } = require("@cucumber/cucumber");
const assert = require("assert");

Then("I should see a step-by-step math solution displayed", async function () {
  const text = await this.page.content();

  assert.ok(
    text.toLowerCase().includes("step") ||
    text.toLowerCase().includes("solution") ||
    text.toLowerCase().includes("answer")
  );
});
