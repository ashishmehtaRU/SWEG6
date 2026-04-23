const { setWorldConstructor } = require("@cucumber/cucumber");

class CustomWorld {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = "http://127.0.0.1:3000";
  }
}

setWorldConstructor(CustomWorld);
