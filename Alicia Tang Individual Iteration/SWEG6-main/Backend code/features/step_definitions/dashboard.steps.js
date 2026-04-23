const { When } = require("@cucumber/cucumber");

When("I enter {string} into the prompt field", async function (text) {
  const input = await this.page.waitForSelector("#promptInput", {
    timeout: 10000,
  });
  await input.click({ clickCount: 3 });
  await input.type(text);
});
