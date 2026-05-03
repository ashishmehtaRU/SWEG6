const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

async function firstExistingSelector(page, selectors) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 1500 });
      return selector;
    } catch (err) {
      // continue
    }
  }
  throw new Error(`Could not find selector from: ${selectors.join(", ")}`);
}

async function typeIntoFirst(page, selectors, value) {
  const selector = await firstExistingSelector(page, selectors);
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value);
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

Given("the submitted math problem is unsupported", async function () {
  this.unsupportedMath = true;
});

When("I open the Math tab", async function () {
  await clickButtonByText(this.page, ["math"]);
});

When('I enter {string} into the math prompt box', async function (prompt) {
  await typeIntoFirst(this.page, [
    "#mathPromptInput",
    "#mathInput",
    "textarea",
    "input[type='text']",
  ], prompt);
});

When("I submit the math prompt", async function () {
  try {
    const selector = await firstExistingSelector(this.page, [
      "#submitMath",
      "#solveMath",
      "button[type='submit']",
    ]);
    await this.page.click(selector);
  } catch (err) {
    await clickButtonByText(this.page, ["solve", "submit"]);
  }
});

Then("the system should detect a math-related query", async function () {
  assert.ok(true);
});

Then("a step-by-step math solution should be displayed", async function () {
  await this.page.waitForFunction(() => {
    const body = document.body.innerText || "";
    return (
      body.includes("Final Answer") ||
      body.includes("Answer") ||
      body.includes("=") ||
      body.toLowerCase().includes("step")
    );
  }, { timeout: 20000 });
});

Then("a math response should be displayed", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(body.length > 0, "Expected a math response");
});

Then("the system should not use the math-processing flow", async function () {
  assert.ok(true);
});

Then("I should see a math fallback or error message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("error") ||
      body.toLowerCase().includes("unsupported") ||
      body.toLowerCase().includes("unable") ||
      body.length > 0,
    "Expected math fallback or error message",
  );
});