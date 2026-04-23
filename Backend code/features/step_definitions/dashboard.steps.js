const { When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

When("I enter {string} into the prompt field", async function (text) {
  const input = await this.page.waitForSelector("#promptInput", {
    timeout: 10000,
  });
  await input.click({ clickCount: 3 });
  await input.type(text);
});

// keep this for normal assistant flow
When("I prepare the page for a stubbed conversation", async function () {
  await this.page.waitForSelector("#promptInput", { timeout: 10000 });

  await this.page.evaluate(() => {
    window.currentConversation = { id: 1 };
    window.activeModel = "llama3:8b";
    window.comparisonPending = false;
    window.promptCounter = 2;
    window.loadConversationDetails = async function () {};

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (url, options) => {
      if (typeof url === "string" && url.includes("/conversation/1/message")) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return {
          ok: true,
          json: async () => ({ response: "Assistant streaming text." }),
        };
      }
      return originalFetch(url, options);
    };
  });
});

// add this as a separate setup for the multi-LLM scenario
When(
  "I prepare the page for a stubbed multi-LLM comparison conversation",
  async function () {
    await this.page.waitForSelector("#promptInput", { timeout: 10000 });

    await this.page.evaluate(() => {
      window.currentConversation = { id: 1 };
      window.activeModel = "llama3:8b";
      window.comparisonPending = false;
      window.promptCounter = 2;
      window.loadConversationDetails = async function () {};

      const originalFetch = window.fetch.bind(window);

      window.fetch = async (url, options) => {
        if (
          typeof url === "string" &&
          url.includes("/conversation/1/message")
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          return {
            ok: true,
            json: async () => ({
              response:
                "llama3:8b: Stubbed llama response.\n\ngemma3:4b: Stubbed gemma response.",
            }),
          };
        }
        return originalFetch(url, options);
      };
    });
  },
);

When("I set the prompt counter for normal assistant flow", async function () {
  await this.page.evaluate(() => {
    window.promptCounter = 2;
    window.comparisonPending = false;
  });
});

When("I submit the prompt", async function () {
  const submitBtn = await this.page.waitForSelector("#submitBtn", {
    timeout: 10000,
  });
  await submitBtn.click();
});

Then("I should see {string} in the chat history", async function (text) {
  await this.page.waitForFunction(
    (expected) => {
      return Array.from(document.querySelectorAll(".history-role-user")).some(
        (node) => node.innerText.includes(expected),
      );
    },
    { timeout: 10000 },
    text,
  );
});

Then("I should see a typing indicator in the chat history", async function () {
  const indicator = await this.page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll(".assistant-stream-text")).some(
        (node) => node.innerText.includes("Typing"),
      ),
    { timeout: 10000 },
  );
  assert.ok(indicator, "Expected typing indicator to appear in chat history");
});
