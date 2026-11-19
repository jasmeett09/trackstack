const express = require("express");
const saleController = require("../controllers/saleController");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const saleValidator = require("../validators/saleValidator");
const validateMiddleware = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(sessionAuthMiddleware);

router.get("/", saleController.listSales);
router.get("/new", allowRoles("admin", "manager"), saleController.renderNewSale);
router.post(
  "/",
  allowRoles("admin", "manager"),
  saleValidator,
  validateMiddleware,
  saleController.createSale
);

module.exports = router;
