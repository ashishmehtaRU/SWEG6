const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

const GOOGLE_CLIENT_ID =
  "360662482535-umsn5nksq2s890hf7oerfg6hbhdefohg.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Check if user exists in database
      db.get(
        "SELECT * FROM users WHERE google_id = ?",
        [profile.id],
        (err, row) => {
          if (err) {
            return done(err);
          }

          if (row) {
            // User exists, return user
            return done(null, row);
          } else {
            // User doesn't exist, create new user
            const email = profile.emails[0].value;
            const name = profile.displayName;
            const avatar =
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : null;

            db.run(
              "INSERT INTO users (username, email, google_id, avatar) VALUES (?, ?, ?, ?)",
              [name, email, profile.id, avatar],
              function (err) {
                if (err) {
                  return done(err);
                }

                // Get the newly created user
                db.get(
                  "SELECT * FROM users WHERE id = ?",
                  [this.lastID],
                  (err, newUser) => {
                    if (err) {
                      return done(err);
                    }
                    return done(null, newUser);
                  },
                );
              },
            );
          }
        },
      );
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    done(err, row);
  });
});

module.exports = passport;
