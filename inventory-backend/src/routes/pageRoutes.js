const express = require("express");
const pageController = require("../controllers/pageController");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");

const router = express.Router();

router.get("/", pageController.renderHome);
router.get("/docs", pageController.renderDocs);
router.get("/register", pageController.renderRegister);
router.get("/login", pageController.renderLogin);
router.get("/dashboard", sessionAuthMiddleware, pageController.renderDashboard);

module.exports = router;
