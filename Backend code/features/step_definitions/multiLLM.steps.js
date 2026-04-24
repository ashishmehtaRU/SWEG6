const { When, Then } = require("@cucumber/cucumber");
const assert = require("assert");


When("I enter {string} into the compare prompt box", async function (text) {
  await this.page.type("#prompt", text);
});

When("I click the compare generate button", async function () {
  await this.page.click("button");
  await new Promise((r) => setTimeout(r, 1000));
});

Then("I should see response 1", async function () {
  const text = await this.page.content();
  assert.ok(text.includes("Detailed answer"));
});

Then("I should see response 2", async function () {
  const text = await this.page.content();
  assert.ok(text.includes("Simple answer"));
});

Then("I should see response 3", async function () {
  const text = await this.page.content();
  assert.ok(text.includes("Alternative perspective"));
});

Then(
  "each response should be displayed in a separate section",
  async function () {
    const text = await this.page.content();
    assert.ok(text.includes("Llama3"));
    assert.ok(text.includes("Mistral"));
    assert.ok(text.includes("Gemma"));
  },
);