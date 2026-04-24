const { When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

When("I enter {string} into the multi prompt field", async function (text) {
  const input = await this.page.waitForSelector("#multiPrompt", {
    timeout: 10000,
  });
  await input.click({ clickCount: 3 });
  await input.type(text);
});

When("I click the compare models button", async function () {
  const button = await this.page.waitForSelector("#compareBtn", {
    timeout: 10000,
  });

  let dialogPromiseResolve;
  const dialogPromise = new Promise((resolve) => {
    dialogPromiseResolve = resolve;
  });

  this.page.once("dialog", async (dialog) => {
    this.lastDialogMessage = dialog.message();
    await dialog.accept();
    dialogPromiseResolve(true);
  });

  await button.click();

  await Promise.race([
    dialogPromise,
    new Promise((resolve) => setTimeout(() => resolve(false), 500)),
  ]);
});

Then("I should see at least two model response cards", async function () {
  await this.page.waitForSelector(".card", { timeout: 60000 });

  const count = await this.page.$$eval(".card", (cards) => cards.length);

  assert.ok(
    count >= 2,
    `Expected at least two model response cards, but found ${count}`,
  );
});

Then("I should remain on the multi-LLM page", async function () {
  const url = this.page.url();
  assert.ok(
    url.includes("multi.html"),
    `Expected to remain on multi.html, but current URL is ${url}`,
  );
});