const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const keys = require("./keys");

const createSessionMiddleware = () => session({
  secret: keys.sessionSecret,
  resave: false,
  saveUninitialized: false,
  ...(keys.isProduction
    ? { store: MongoStore.create({ client: mongoose.connection.getClient() }) }
    : {}),
  cookie: {
    secure: keys.isProduction,
    sameSite: keys.isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
});

module.exports = { createSessionMiddleware };
