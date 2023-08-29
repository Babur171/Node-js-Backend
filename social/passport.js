const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require("../config/index");

passport.use(
  new GoogleStrategy(
    {
      clientID: `${GOOGLE_CLIENT_ID}`,
      clientSecret: `${GOOGLE_CLIENT_SECRET}`,
      callbackURL: "http://localhost:3001/auth/google/callback", // Update the callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      // Callback function when user is authenticated
      // You can save the user data to your database here
      return done(null, profile);
    }
  )
);

// Serialize user data into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user data from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
