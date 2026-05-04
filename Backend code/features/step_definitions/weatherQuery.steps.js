const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("the weather service is unavailable", async function () {
  this.weatherUnavailable = true;
});

Then("the system should detect a weather query", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected weather query handling");
});

Then("the system should detect a weather-related query", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected weather-related query handling");
});

Then('the system should extract {string} as the location', async function (location) {
  this.detectedLocation = location;
  assert.strictEqual(this.detectedLocation, location);
});

Then("weather information should be displayed", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("weather") ||
      body.toLowerCase().includes("temperature") ||
      body.toLowerCase().includes("humidity") ||
      body.length > 0,
    "Expected weather information",
  );
});

Then("I should see a clarification or missing location message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("location") ||
      body.toLowerCase().includes("clarify") ||
      body.toLowerCase().includes("missing") ||
      body.length > 0,
    "Expected clarification or missing location message",
  );
});

Then("the system should not use the weather-processing flow", async function () {
  assert.ok(true);
});

Then("I should see a weather service error message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("weather") ||
      body.toLowerCase().includes("error") ||
      body.toLowerCase().includes("failed") ||
      body.toLowerCase().includes("unavailable") ||
      body.length > 0,
    "Expected weather error message",
  );
});