const express = require("express");
const categoryController = require("../controllers/categoryController");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const categoryValidator = require("../validators/categoryValidator");

const router = express.Router();

router.use(sessionAuthMiddleware);

router.get("/", categoryController.listCategories);
router.get("/new", allowRoles("admin", "manager"), categoryController.renderNewCategory);
router.post("/", allowRoles("admin", "manager"), categoryValidator, validateMiddleware, categoryController.createCategory);
router.get("/:id/edit", allowRoles("admin", "manager"), categoryController.renderEditCategory);
router.put("/:id", allowRoles("admin", "manager"), categoryValidator, validateMiddleware, categoryController.updateCategory);
router.delete("/:id", allowRoles("admin"), categoryController.deleteCategory);

module.exports = router;
