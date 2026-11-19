const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("./config/passport");
const keys = require("./config/keys");
const { createSessionMiddleware } = require("./config/session");
const { apiLimiter, securityHeaders } = require("./config/security");

const loggerMiddleware = require("./middlewares/loggerMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");

const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

app.set("trust proxy", 1);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Application-level middleware: request logging, body parsing, cookies, sessions.
app.use(securityHeaders);
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const isAllowedOrigin = requestOrigin && keys.allowedOrigins.includes(requestOrigin);
  const isSameOrigin = requestOrigin === `${req.protocol}://${req.get("host")}`;
  const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);

  if (requestOrigin && !isAllowedOrigin && !isSameOrigin && !isSafeMethod) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }

  if (isAllowedOrigin) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.locals.sessionMiddleware = createSessionMiddleware();
app.use(app.locals.sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.currentPath = req.path;
  res.locals.role = req.user ? req.user.role : null;
  next();
});

app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/categories", categoryRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/transactions", transactionRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/sales", saleRoutes);
app.use("/api", apiLimiter);
app.use("/api", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
