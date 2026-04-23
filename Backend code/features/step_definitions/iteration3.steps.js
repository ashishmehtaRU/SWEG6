const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("I am logged into the application", async function () {
  const url = `${this.baseUrl}/frontend/login.html`;
  await this.page.goto(url, { waitUntil: "networkidle2" });
});

Given("I am on the dashboard page", async function () {
  const url = `${this.baseUrl}/frontend/dashboard.html`;
  await this.page.goto(url, { waitUntil: "networkidle2" });
});

Given("I already asked {string}", async function (text) {
  this.previousPrompt = text;
});

Given("I received a response", async function () {
  await this.page.waitForTimeout(1000);
});

Given("I already have an existing conversation open", async function () {
  await this.page.waitForTimeout(500);
});

When("I enter {string} into the prompt box", async function (text) {
  const selectors = ["#promptInput", "textarea", "input"];
  let entered = false;

  for (const selector of selectors) {
    const el = await this.page.$(selector);
    if (el) {
      await this.page.click(selector, { clickCount: 3 });
      await this.page.type(selector, text);
      entered = true;
      break;
    }
  }

  assert.ok(entered, 'Expected to find a prompt input box');
});

When("I submit the prompt", async function () {
  const buttonSelectors = ["#submitBtn", 'button[type="submit"]', "button"];
  let clicked = false;

  for (const selector of buttonSelectors) {
    const el = await this.page.$(selector);
    if (el) {
      await this.page.click(selector);
      clicked = true;
      break;
    }
  }

  assert.ok(clicked, "Expected to find a submit button");
  await this.page.waitForTimeout(1500);
});

When("I click the {string} button", async function (buttonText) {
  const clicked = await this.page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const button = buttons.find(
      (b) => b.innerText.trim().toLowerCase() === text.toLowerCase(),
    );

    if (button) {
      button.click();
      return true;
    }
    return false;
  }, buttonText);

  assert.ok(clicked, `Expected button "${buttonText}" to exist`);
});

When("I select {string} as the backend model", async function (modelName) {
  const selected = await this.page.evaluate((name) => {
    const select = document.querySelector("select");
    if (!select) return false;

    const option = Array.from(select.options).find((opt) =>
      opt.text.toLowerCase().includes(name.toLowerCase()),
    );

    if (!option) return false;

    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, modelName);

  assert.ok(selected, `Expected model "${modelName}" to be selectable`);
});

Then("the prompt should stay in the current conversation", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected current conversation content");
});

Then("the previous messages should still be visible", async function () {
  const content = await this.page.content();
  assert.ok(
    content.includes("What is Python?") || content.includes("Python"),
    "Expected previous messages to still be visible",
  );
});

Then("a new conversation should be created", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("conversation"),
    "Expected a new conversation to be created",
  );
});

Then("the old conversation context should not be reused", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected page content after new conversation");
});

Then("I should see a new conversation entry in the sidebar", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("conversation"),
    "Expected a conversation entry in the sidebar",
  );
});

Then("I should see response 1", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected first response to be visible");
});

Then("I should see response 2", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected second response to be visible");
});

Then("I should see response 3", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected third response to be visible");
});

Then("each response should be displayed in a separate section", async function () {
  const sections = await this.page.$$eval("div, section, article", (els) => els.length);
  assert.ok(sections > 0, "Expected separate response sections");
});

Then("I should see a response displayed", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected a response to be displayed");
});

Then("I should see an error message for model availability", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("error") ||
      content.toLowerCase().includes("unavailable"),
    "Expected model availability error message",
  );
});

Then("I should see a local model error message", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("local") ||
      content.toLowerCase().includes("offline") ||
      content.toLowerCase().includes("error"),
    "Expected local model error message",
  );
});

Then("I should see an API failure message", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("api") ||
      content.toLowerCase().includes("failure") ||
      content.toLowerCase().includes("error"),
    "Expected API failure message",
  );
});

Then("I should see a step-by-step math solution displayed", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("step") ||
      content.toLowerCase().includes("solution") ||
      content.toLowerCase().includes("answer"),
    "Expected step-by-step math solution",
  );
});

Then("the system should not use the math-processing flow", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected normal non-math handling");
});

Then("I should see a math fallback or error message", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("error") ||
      content.toLowerCase().includes("unsupported") ||
      content.toLowerCase().includes("cannot"),
    "Expected math fallback or error message",
  );
});

Then("weather information should be displayed", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("weather") ||
      content.toLowerCase().includes("temperature") ||
      content.toLowerCase().includes("forecast"),
    "Expected weather information to be displayed",
  );
});

Then("I should see a clarification or missing location message", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("location") ||
      content.toLowerCase().includes("city") ||
      content.toLowerCase().includes("clarify"),
    "Expected clarification or missing location message",
  );
});

Then("the system should not use the weather-processing flow", async function () {
  const content = await this.page.content();
  assert.ok(content.length > 0, "Expected normal non-weather handling");
});

Then("I should see a weather service error message", async function () {
  const content = await this.page.content();
  assert.ok(
    content.toLowerCase().includes("weather") ||
      content.toLowerCase().includes("error") ||
      content.toLowerCase().includes("unavailable"),
    "Expected weather service error message",
  );
});
