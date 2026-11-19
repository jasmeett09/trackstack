const express = require("express");
const transactionController = require("../controllers/transactionController");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const transactionValidator = require("../validators/transactionValidator");

const router = express.Router();

router.use(sessionAuthMiddleware);

router.get("/", transactionController.listTransactions);
router.get("/new", allowRoles("admin", "manager"), transactionController.renderNewTransaction);
router.post(
  "/",
  allowRoles("admin", "manager"),
  transactionValidator,
  validateMiddleware,
  transactionController.createTransaction
);

module.exports = router;
