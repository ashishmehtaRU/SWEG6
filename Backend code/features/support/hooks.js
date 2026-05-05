const { Before, After, setDefaultTimeout } = require("@cucumber/cucumber");
const puppeteer = require("puppeteer");

setDefaultTimeout(60 * 1000);

Before(async function () {
  this.browser = await puppeteer.launch({
    headless: false,
    slowMo: 0,
  });

  this.page = await this.browser.newPage();
  this.baseUrl = "http://localhost:3000";
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});