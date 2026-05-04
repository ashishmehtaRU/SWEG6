const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

async function firstExistingSelector(page, selectors, timeout = 4000) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout });
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

async function captureNextDialog(world) {
  world.lastDialogMessage = null;
  world.page.once("dialog", async (dialog) => {
    world.lastDialogMessage = dialog.message();
    await dialog.accept();
  });
}

Given("I open the Images tab", async function () {
  try {
    await clickButtonByText(this.page, ["images", "image"]);
  } catch (err) {
    const body = await this.page.evaluate(() => document.body.innerText || "");
    assert.ok(body.includes("Images"), "Expected Images tab");
  }
});

Given("the image generation service is unavailable", async function () {
  await this.page.setRequestInterception(true);

  this.page.removeAllListeners("request");
  this.page.on("request", (request) => {
    if (request.url().includes("/api/images/generate")) {
      request.respond({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to generate image." }),
      });
      return;
    }
    request.continue();
  });
});

When("I enter {string} into the image prompt box", async function (prompt) {
  await typeIntoFirst(this.page, [
    "#imagePromptInput",
    "textarea#imagePromptInput",
    "textarea",
    "input[type='text']",
  ], prompt);
});

When("I submit the image prompt", async function () {
  try {
    await clickFirst(this.page, [
      "#generateImageBtn",
      "#submitImage",
      "#generateImage",
      "button[type='submit']",
    ]);
  } catch (err) {
    await clickButtonByText(this.page, ["generate image", "generate", "submit"]);
  }
});

When("I submit the image prompt without entering text", async function () {
  await captureNextDialog(this);

  try {
    await clickFirst(this.page, [
      "#generateImageBtn",
      "#submitImage",
      "#generateImage",
      "button[type='submit']",
    ]);
  } catch (err) {
    await clickButtonByText(this.page, ["generate image", "generate", "submit"]);
  }
});

Then("a generated image should be displayed", async function () {
  await this.page.waitForFunction(() => {
    const history = document.querySelector("#imageChatHistory");
    const img = document.querySelector("#imageChatHistory img") || document.querySelector("img");
    return !!img || (history && (history.innerText || "").trim().length > 0);
  }, { timeout: 20000 });

  const hasImage = await this.page.$("#imageChatHistory img") || await this.page.$("img");
  assert.ok(hasImage, "Expected a generated image to be displayed");
});

Then("I should see an image prompt validation message", async function () {
  assert.ok(
    this.lastDialogMessage &&
      this.lastDialogMessage.includes("Please enter an image prompt."),
    `Expected image prompt validation alert, got: ${this.lastDialogMessage}`
  );
});

Then("I should see an image generation error message", async function () {
  await this.page.waitForFunction(() => {
    const status = document.querySelector("#imageStatus");
    const body = document.body.innerText || "";
    return (
      (status && (status.innerText || "").toLowerCase().includes("failed")) ||
      (status && (status.innerText || "").toLowerCase().includes("error")) ||
      body.toLowerCase().includes("failed to generate image")
    );
  }, { timeout: 10000 });

  const body = await this.page.evaluate(() => document.body.innerText || "");
  assert.ok(
    body.toLowerCase().includes("failed to generate image") ||
      body.toLowerCase().includes("error"),
    "Expected image generation error message",
  );
});