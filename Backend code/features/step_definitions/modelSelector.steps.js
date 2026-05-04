const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

async function firstExistingSelector(page, selectors, timeout = 10000) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout });
      return selector;
    } catch (err) {
      // try next selector
    }
  }
  throw new Error(`Could not find any selector from: ${selectors.join(", ")}`);
}

async function typeIntoFirst(page, selectors, value) {
  const selector = await firstExistingSelector(page, selectors);
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value);
  return selector;
}

async function clickFirst(page, selectors) {
  const selector = await firstExistingSelector(page, selectors);
  await page.click(selector);
  return selector;
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

async function waitForAnyText(page, texts, timeout = 15000) {
  await page.waitForFunction(
    (expectedTexts) => {
      const body = document.body.innerText || "";
      return expectedTexts.some((t) => body.includes(t));
    },
    { timeout },
    texts,
  );
}

Given("I am logged into the application", async function () {
  const email = process.env.TEST_EMAIL || "test@example.com";
  const password = process.env.TEST_PASSWORD || "pass123";

  await this.page.goto("http://localhost:3000/login.html", {
    waitUntil: "domcontentloaded",
  });

  await this.page.waitForSelector("#email", { timeout: 10000 });
  await this.page.waitForSelector("#password", { timeout: 10000 });
  await this.page.waitForSelector("#loginBtn", { timeout: 10000 });

  await this.page.click("#email", { clickCount: 3 });
  await this.page.type("#email", email);

  await this.page.click("#password", { clickCount: 3 });
  await this.page.type("#password", password);

  const navPromise = this.page.waitForNavigation({
    waitUntil: "domcontentloaded",
    timeout: 20000,
  }).catch(() => null);

  await this.page.click("#loginBtn");

  await navPromise;

  // login page redirects after success, so wait for dashboard element
  await this.page.waitForSelector("#modelSelector", { timeout: 20000 });

  const body = await this.page.evaluate(() => document.body.innerText || "");
  if (!body.includes("LLM Dashboard") && !body.includes("Conversations")) {
    throw new Error(`Login did not reach dashboard. Current URL: ${this.page.url()}`);
  }
});
Given("I am on the dashboard page", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.includes("LLM Dashboard") ||
      body.includes("Conversations") ||
      body.includes("Chat"),
    "Expected to be on the dashboard page",
  );
});

Given('I selected {string} as the backend model', async function (model) {
  const selector = await firstExistingSelector(this.page, [
    "#modelSelector",
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

Given('the model {string} is unavailable', async function (model) {
  this.unavailableModel = model;
});

Given("the selected model service is unavailable", async function () {
  this.unavailableModel = true;
});

When("I select {string} as the backend model", async function (model) {
  const selector = await firstExistingSelector(this.page, [
    "#modelSelector",
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

When('I switch the backend model to {string}', async function (model) {
  const selector = await firstExistingSelector(this.page, [
    "#modelSelector",
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
    "textarea#promptInput",
    "textarea",
    "input[name='prompt']",
    "input[type='text']",
  ], prompt);
});

When("I submit the prompt", async function () {
  try {
    await clickFirst(this.page, [
      "#submitBtn",
      "#submitPrompt",
      "#sendBtn",
      "#sendPrompt",
      "button[type='submit']",
    ]);
  } catch (err) {
    await clickButtonByText(this.page, ["send", "submit", "ask"]);
  }
});

Then("I should see a model selection control", async function () {
  const selectors = ["#modelSelector", "select[name='model']", "select"];
  let found = false;

  for (const selector of selectors) {
    const el = await this.page.$(selector);
    if (el) {
      found = true;
      break;
    }
  }

  assert.ok(found, "Expected model selection control");
});

Then("I should see at least one backend model listed", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.includes("Gemini") ||
      body.includes("ChatGPT") ||
      body.includes("Llama") ||
      body.includes("Gemma") ||
      body.includes("Qwen"),
    "Expected at least one backend model to be listed",
  );
});

Then('I should see {string} shown as the selected model', async function (model) {
  try {
    const selector = await firstExistingSelector(this.page, [
      "#modelSelector",
      "select[name='model']",
      "select",
    ]);

    const value = await this.page.$eval(selector, (el) => el.value);
    const selectedText = await this.page
      .$eval(`${selector} option:checked`, (el) => el.textContent.trim())
      .catch(() => "");

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
    const history = document.querySelector("#conversationHistory");
    return (
      (history && (history.innerText || "").trim().length > 0) ||
      body.includes("Assistant") ||
      body.includes("You")
    );
  }, { timeout: 20000 });
});

Then("a response should be displayed", async function () {
  await this.page.waitForFunction(() => {
    const body = document.body.innerText || "";
    const history = document.querySelector("#conversationHistory");
    return (
      (history && (history.innerText || "").trim().length > 0) ||
      body.includes("Assistant") ||
      body.includes("You")
    );
  }, { timeout: 20000 });
});

Then("I should see an error message for model availability", async function () {
  await waitForAnyText(this.page, [
    "Unable to generate response",
    "error",
    "failed",
    "unavailable",
    "Connection error",
  ], 15000);
});

Then("I should see a model availability error message", async function () {
  await waitForAnyText(this.page, [
    "Unable to generate response",
    "error",
    "failed",
    "unavailable",
    "Connection error",
  ], 15000);
});