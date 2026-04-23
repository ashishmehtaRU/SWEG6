const { Then } = require("@cucumber/cucumber");
const assert = require("assert");

Then("weather information should be displayed", async function () {
  const text = await this.page.content();

  assert.ok(
    text.toLowerCase().includes("weather") ||
    text.toLowerCase().includes("temperature") ||
    text.toLowerCase().includes("forecast")
  );
});
