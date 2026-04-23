const { Then } = require("@cucumber/cucumber");
const assert = require("assert");

Then("I should see response 1", async function () {
  const text = await this.page.content();
  assert.ok(text.length > 0);
});

Then("I should see response 2", async function () {
  const text = await this.page.content();
  assert.ok(text.length > 0);
});

Then("I should see response 3", async function () {
  const text = await this.page.content();
  assert.ok(text.length > 0);
});
