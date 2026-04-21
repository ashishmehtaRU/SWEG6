const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes");
require("./auth");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(bodyParser.json());

app.use(
  session({
    secret: "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",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("../frontend"));
app.use("/api", routes);

if (require.main === module) {
  app.listen(3000, () => {
    console.log("server is running");
  });
}

module.exports = app;
