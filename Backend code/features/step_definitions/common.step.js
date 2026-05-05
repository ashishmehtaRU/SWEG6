const { Given, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("I open the {string} page", async function (file) {
  const url = `${this.baseUrl}/${file}`;
  await this.page.goto(url, { waitUntil: "networkidle2" });
});

Then("I should see the text {string}", async function (text) {
  await this.page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    { timeout: 10000 },
    text,
  );
});

Then("I should see an element with id {string}", async function (id) {
  const el = await this.page.waitForSelector(`#${id}`, { timeout: 10000 });
  assert.ok(el, `Expected element with id "${id}"`);
});

Then("I should see a link to {string}", async function (href) {
  const links = await this.page.$$eval("a", (a) =>
    a.map((x) => x.getAttribute("href")),
  );

  assert.ok(
    links.includes(href),
    `Expected link to "${href}" but found: ${links.join(", ")}`,
  );
});

Then(
  "I should see an input with id {string} and type {string}",
  async function (id, type) {
    const actual = await this.page.$eval(`#${id}`, (el) =>
      el.getAttribute("type"),
    );

    assert.strictEqual(
      actual,
      type,
      `Expected input "${id}" to have type "${type}", got "${actual}"`,
    );
  },
);

Then("I should see a button with id {string}", async function (id) {
  const btn = await this.page.waitForSelector(`#${id}`, { timeout: 10000 });
  assert.ok(btn, `Expected button with id "${id}"`);
});

Then(
  "I should see the value {string} in the element with id {string}",
  async function (value, id) {
    const actual = await this.page.$eval(`#${id}`, (el) => el.value);

    assert.strictEqual(
      actual,
      value,
      `Expected element "${id}" to have value "${value}", got "${actual}"`,
    );
  },
);
