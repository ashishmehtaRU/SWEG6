const { Given, When, Then, setDefaultTimeout } = require("@cucumber/cucumber");
const assert = require("assert");

setDefaultTimeout(180000);

Given("I create a new conversation", async function () {
  await this.page.waitForSelector("#newConversationTitle");
  await this.page.click("#newConversationTitle", { clickCount: 3 });
  await this.page.type("#newConversationTitle", "Test Conversation");
  await this.page.click('button[onclick="createConversation()"]');

  await this.page.waitForFunction(() => {
    const title = document.getElementById("activeConversationTitle");
    return (
      title &&
      title.textContent &&
      !title.textContent.includes("No conversation selected")
    );
  }, { timeout: 15000 });
});

When("I click the button with id {string}", async function (buttonId) {
  await this.page.waitForSelector(`#${buttonId}`);
  await this.page.click(`#${buttonId}`);

  if (buttonId === "submitBtn") {
    const promptValue = await this.page.$eval("#promptInput", (el) => el.value.trim());

    if (promptValue) {
      await this.page.waitForFunction(
        () => document.querySelectorAll(".multi-response-card").length === 3,
        { timeout: 300000 }
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } else if (buttonId === "regenerateBtn") {
    await this.page.waitForFunction(
      () => document.querySelectorAll(".multi-response-card").length === 3,
      { timeout: 300000 }
    );
  } else {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
});

Then("I should see 3 generated response cards", async function () {
  await this.page.waitForFunction(
    () => document.querySelectorAll(".multi-response-card").length === 3,
    { timeout: 300000 }
  );

  const count = await this.page.$$eval(
    ".multi-response-card",
    (cards) => cards.length
  );

  assert.strictEqual(count, 3, `Expected 3 response cards, but found ${count}.`);
});

Then("I should see one best response label", async function () {
  await this.page.waitForSelector(".best-badge", { timeout: 300000 });

  const count = await this.page.$$eval(
    ".best-badge",
    (badges) => badges.length
  );

  assert.strictEqual(count, 1, `Expected 1 best response label, but found ${count}.`);
});

Then("I should see an alert", async function () {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  assert(
    this.lastAlertText && this.lastAlertText.length > 0,
    "Expected an alert to appear, but none was detected."
  );
});
 


