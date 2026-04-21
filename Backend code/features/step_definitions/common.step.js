const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given('I open the {string} page', async function (fileName) {
  await this.page.goto(`http://localhost:3000/${fileName}`, {
    waitUntil: "networkidle2",
  });
});

Then('I should see the text {string}', async function (expectedText) {
  const pageText = await this.page.evaluate(() => document.body.innerText);
  assert(
    pageText.includes(expectedText),
    `Expected to find text "${expectedText}" on the page.`,
  );
});

Then('I should see an element with id {string}', async function (elementId) {
  const element = await this.page.$(`#${elementId}`);
  assert(element, `Expected element with id "${elementId}" to exist.`);
});

Then(
  'I should see the value {string} in the element with id {string}',
  async function (expectedValue, elementId) {
    const value = await this.page.$eval(`#${elementId}`, (el) => el.value);
    assert.strictEqual(
      value,
      expectedValue,
      `Expected value "${expectedValue}" in element "${elementId}", but got "${value}".`,
    );
  },
);