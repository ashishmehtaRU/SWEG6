const { When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

When("I enter {string} into the email field", async function (email) {
  const input = await this.page.waitForSelector("#email", { timeout: 10000 });
  await input.click({ clickCount: 3 });
  await input.type(email);
});

When("I enter {string} into the password field", async function (password) {
  const input = await this.page.waitForSelector("#password", {
    timeout: 10000,
  });
  await input.click({ clickCount: 3 });
  await input.type(password);
});

When("I click the login button", async function () {
  const button = await this.page.waitForSelector("#loginBtn", {
    timeout: 10000,
  });
  await button.click();
});

Then("I should see the error message {string}", async function (message) {
  await this.page.waitForFunction(
    (msg) => document.body.innerText.includes(msg),
    { timeout: 10000 },
    message,
  );

  const text = await this.page.evaluate(() => document.body.innerText);

  assert.ok(
    text.includes(message),
    `Expected error message "${message}" not found`,
  );
});
