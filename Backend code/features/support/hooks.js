const { Before, After, setDefaultTimeout } = require("@cucumber/cucumber");
const puppeteer = require("puppeteer");

setDefaultTimeout(20000);

Before(async function () {
  this.browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
  });

  this.page = await this.browser.newPage();
  this.baseUrl = "http://127.0.0.1:3000";
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});
