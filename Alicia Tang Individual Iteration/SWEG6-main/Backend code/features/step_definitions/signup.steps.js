const { When } = require("@cucumber/cucumber");

When("I enter {string} into the username field", async function (username) {
  const input = await this.page.waitForSelector("#username", {
    timeout: 10000,
  });
  await input.click({ clickCount: 3 });
  await input.type(username);
});

When("I click the signup button", async function () {
  const button = await this.page.waitForSelector("#signupBtn", {
    timeout: 10000,
  });
  await button.click();
});
