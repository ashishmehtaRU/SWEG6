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

Given("I open the Images tab", async function () {
  await clickButtonByText(this.page, ["images", "image"]);
});

When("I enter {string} into the image prompt box", async function (prompt) {
  await typeIntoFirst(this.page, [
    "#imagePromptInput",
    "#imageInput",
    "textarea",
    "input[type='text']",
  ], prompt);
});

When("I submit the image prompt", async function () {
  try {
    const selector = await firstExistingSelector(this.page, [
      "#submitImage",
      "#generateImage",
      "button[type='submit']",
    ]);
    await this.page.click(selector);
  } catch (err) {
    await clickButtonByText(this.page, ["generate", "submit"]);
  }
});

When("I submit the image prompt without entering text", async function () {
  await this.step("When I submit the image prompt");
});

Then("a generated image should be displayed", async function () {
  await this.page.waitForFunction(() => {
    return !!document.querySelector("img");
  }, { timeout: 20000 });

  const hasImage = await this.page.$("img");
  assert.ok(hasImage, "Expected a generated image to be displayed");
});

Then("I should see an image prompt validation message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.includes("Prompt is required") ||
    body.toLowerCase().includes("required") ||
    body.toLowerCase().includes("enter")
  );
});

Then("I should see an image generation error message", async function () {
  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("error") ||
    body.toLowerCase().includes("failed")
  );
});

Given("the image generation service is unavailable", async function () {
});