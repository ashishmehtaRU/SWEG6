const { When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

When('I click the "New Conversation" button', async function () {
  const btn = await this.page.waitForSelector("button", { timeout: 10000 });
  await btn.click();
});

Then("I should see a new conversation entry in the sidebar", async function () {
  const text = await this.page.content();
  assert.ok(text.includes("conversation"));
});
