const express = require("express");
const authController = require("../controllers/authController");
const { authLimiter } = require("../config/security");
const { registerValidator, loginValidator } = require("../validators/authValidator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validateMiddleware, authController.register);
router.post("/login", authLimiter, loginValidator, validateMiddleware, authController.login);
router.post("/logout", sessionAuthMiddleware, authController.logout);
router.get("/token", sessionAuthMiddleware, authController.issueJwt);

module.exports = router;
