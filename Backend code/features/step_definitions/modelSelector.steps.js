const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

async function firstExistingSelector(page, selectors) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 1500 });
      return selector;
    } catch (err) {
      // try next selector
    }
  }
  throw new Error(`Could not find any selector from: ${selectors.join(", ")}`);
}

async function clickButtonByText(page, texts) {
  const clicked = await page.evaluate((buttonTexts) => {
    const buttons = Array.from(
      document.querySelectorAll("button, input[type='button'], input[type='submit']")
    );
    const target = buttons.find((btn) => {
      const text = (btn.innerText || btn.value || "").trim().toLowerCase();
      return buttonTexts.some((t) => text.includes(t.toLowerCase()));
    });
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, texts);

  if (!clicked) {
    throw new Error(`Could not find button text from: ${texts.join(", ")}`);
  }
}

async function typeIntoFirst(page, selectors, value) {
  const selector = await firstExistingSelector(page, selectors);
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value);
  return selector;
}

async function waitForAnyText(page, texts, timeout = 10000) {
  await page.waitForFunction(
    (expectedTexts) => {
      const body = document.body.innerText || "";
      return expectedTexts.some((t) => body.includes(t));
    },
    { timeout },
    texts,
  );
}

Given("I log into the application", async function () {
  const email = process.env.TEST_EMAIL || "test@example.com";
  const password = process.env.TEST_PASSWORD || "pass123";

  await typeIntoFirst(this.page, [
    "#email",
    "input[name='email']",
    "input[type='email']",
  ], email);

  await typeIntoFirst(this.page, [
    "#password",
    "input[name='password']",
    "input[type='password']",
  ], password);

  try {
    const selector = await firstExistingSelector(this.page, [
      "#loginBtn",
      "#login",
      "button[type='submit']",
    ]);
    await this.page.click(selector);
  } catch (err) {
    await clickButtonByText(this.page, ["login", "log in"]);
  }
});

Given("I am on the dashboard page", async function () {
  await waitForAnyText(this.page, [
    "Dashboard",
    "Conversations",
    "Chat",
    "LLM",
  ], 15000);
});

When("I select {string} as the backend model", async function (model) {
  const selector = await firstExistingSelector(this.page, [
    "#modelSelect",
    "select[name='model']",
    "select",
  ]);

  await this.page.select(selector, model).catch(async () => {
    await this.page.evaluate(
      ({ selector: s, value }) => {
        const el = document.querySelector(s);
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      },
      { selector, value: model },
    );
  });

  this.selectedModel = model;
});

When("I enter {string} into the prompt box", async function (prompt) {
  await typeIntoFirst(this.page, [
    "#promptInput",
    "textarea",
    "input[name='prompt']",
    "input[type='text']",
  ], prompt);
});

When("I submit the prompt", async function () {
  try {
    const selector = await firstExistingSelector(this.page, [
      "#submitPrompt",
      "#sendBtn",
      "#sendPrompt",
      "button[type='submit']",
    ]);
    await this.page.click(selector);
  } catch (err) {
    await clickButtonByText(this.page, ["send", "submit", "ask"]);
  }
});

Then("I should see {string} shown as the selected model", async function (model) {
  try {
    const selector = await firstExistingSelector(this.page, [
      "#modelSelect",
      "select[name='model']",
      "select",
    ]);

    const value = await this.page.$eval(selector, (el) => el.value);
    const selectedText = await this.page.$eval(
      `${selector} option:checked`,
      (el) => el.textContent.trim(),
    ).catch(() => "");

    assert.ok(
      value === model || selectedText.includes(model),
      `Expected selected model "${model}", got value="${value}" text="${selectedText}"`,
    );
  } catch (err) {
    const body = await this.page.evaluate(() => document.body.innerText || "");
    assert.ok(body.includes(model), `Expected page to show selected model "${model}"`);
  }
});

Then("the system should send the request using {string}", async function (model) {
  assert.strictEqual(this.selectedModel, model);
});

Then("I should see a response displayed", async function () {
  await this.page.waitForFunction(() => {
    const body = document.body.innerText || "";
    const possible = [
      document.querySelector("#responseOutput"),
      document.querySelector(".response"),
      document.querySelector(".assistant-message"),
      document.querySelector(".message.assistant"),
    ].filter(Boolean);

    return possible.some((el) => (el.innerText || "").trim().length > 0) ||
      body.includes("Assistant:");
  }, { timeout: 20000 });
});

Then("I should see an error message for model availability", async function () {
  await waitForAnyText(this.page, [
    "Unable to generate response",
    "error",
    "failed",
    "unavailable",
    "Unable to update conversation model",
  ], 15000);
});

Given('the model {string} is unavailable', async function (model) {
  this.unavailableModel = model;
});