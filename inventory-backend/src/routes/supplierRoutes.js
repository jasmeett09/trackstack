const express = require("express");
const supplierController = require("../controllers/supplierController");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const supplierValidator = require("../validators/supplierValidator");

const router = express.Router();

router.use(sessionAuthMiddleware);

router.get("/", supplierController.listSuppliers);
router.get("/new", allowRoles("admin"), supplierController.renderNewSupplier);
router.post("/", allowRoles("admin"), supplierValidator, validateMiddleware, supplierController.createSupplier);
router.get("/:id/edit", allowRoles("admin"), supplierController.renderEditSupplier);
router.put("/:id", allowRoles("admin"), supplierValidator, validateMiddleware, supplierController.updateSupplier);
router.delete("/:id", allowRoles("admin"), supplierController.deleteSupplier);

module.exports = router;
