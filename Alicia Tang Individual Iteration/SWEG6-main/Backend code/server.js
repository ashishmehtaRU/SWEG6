const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes");
require("./auth"); // Initialize passport configuration

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
    secret: "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", // In production, use a proper secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true in production with HTTPS
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("../frontend"));

app.use("/api", routes);

app.listen(3000, () => {
  console.log("server is running");
});
