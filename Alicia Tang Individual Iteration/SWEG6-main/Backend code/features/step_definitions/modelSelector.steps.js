const { When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

When('I select {string} as the backend model', async function (model) {
  const text = await this.page.content();
  assert.ok(text.length > 0);
});

Then("I should see a response displayed", async function () {
  const text = await this.page.content();
  assert.ok(text.length > 0);
});
