const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const authService = require("../services/authService");

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await authService.verifyUserCredentials(email, password);

      if (!user) {
        return done(null, false, { message: "Invalid email or password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
