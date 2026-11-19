const express = require("express");
const purchaseController = require("../controllers/purchaseController");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const purchaseValidator = require("../validators/purchaseValidator");
const validateMiddleware = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(sessionAuthMiddleware);

router.get("/", purchaseController.listPurchases);
router.get("/new", allowRoles("admin", "manager"), purchaseController.renderNewPurchase);
router.post(
  "/",
  allowRoles("admin", "manager"),
  purchaseValidator,
  validateMiddleware,
  purchaseController.createPurchase
);

module.exports = router;
