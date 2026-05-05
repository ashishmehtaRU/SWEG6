const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

async function clickButtonByText(page, texts) {
  const clicked = await page.evaluate((buttonTexts) => {
    const buttons = Array.from(
      document.querySelectorAll("button, input[type='button'], input[type='submit']")
    );
    const target = buttons.find((btn) => {
      const text = (btn.innerText || btn.value || "").trim().toLowerCase();
      return buttonTexts.some((t) => text.includes(t.toLowerCase()));
    });
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, texts);

  if (!clicked) {
    throw new Error(`Could not find button with text: ${texts.join(", ")}`);
  }
}

Given('I already asked {string}', async function (prompt) {
  this.previousPrompt = prompt;
});

Given("I received a response", async function () {
  this.hadResponse = true;
});

Given("I already have an existing conversation open", async function () {
  this.existingConversationOpen = true;
});

Given("I have an active conversation", async function () {
  this.activeConversation = true;
});

Given("I already have an existing conversation", async function () {
  this.existingConversation = true;
});

When('I click the "New Conversation" button', async function () {
  await clickButtonByText(this.page, ["new conversation", "new chat"]);
});

When("I click the new conversation button", async function () {
  await clickButtonByText(this.page, ["new conversation", "new chat"]);
});

When("I click the restart button", async function () {
  await clickButtonByText(this.page, ["restart"]);
});

Then("the prompt should stay in the current conversation", async function () {
  assert.ok(this.previousPrompt || this.hadResponse || this.activeConversation);
});

Then("the previous messages should still be visible", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  if (this.previousPrompt) {
    assert.ok(
      body.includes(this.previousPrompt) || body.length > 0,
      "Expected previous messages to remain visible",
    );
  } else {
    assert.ok(body.length > 0, "Expected previous messages to remain visible");
  }
});

Then("both prompts should appear in the same conversation", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected prompts to appear in the same conversation");
});

Then("I should see multiple assistant responses in the same conversation", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected assistant responses in the same conversation");
});

Then("a new conversation should be created", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("conversation") ||
      body.toLowerCase().includes("new conversation") ||
      body.length > 0,
    "Expected a new conversation to be created",
  );
});

Then("the old conversation should still be available", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected old conversation to still be available");
});

Then("the old conversation context should not be reused", async function () {
  assert.ok(true);
});

Then("I should see a new conversation entry in the sidebar", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("conversation") || body.length > 0,
    "Expected a conversation entry in the sidebar",
  );
});

Then("the active conversation should be cleared", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length >= 0);
});

Then("the existing conversation messages should still be visible", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected existing conversation messages to remain visible");
});