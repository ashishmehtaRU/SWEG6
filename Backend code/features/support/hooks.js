const { Before, After } = require("@cucumber/cucumber");
const puppeteer = require("puppeteer");

Before(async function () {
  this.browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  this.page = await this.browser.newPage();

  this.page.on("dialog", async (dialog) => {
    this.lastAlertText = dialog.message();
    await dialog.accept();
  });
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});