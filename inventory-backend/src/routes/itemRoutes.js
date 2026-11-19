const express = require("express");
const itemController = require("../controllers/itemController");
const { imageUpload } = require("../config/cloudinary");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const itemValidator = require("../validators/itemValidator");

const router = express.Router();

router.use(sessionAuthMiddleware);

router.get("/", itemController.listItems);
router.get("/new", allowRoles("admin", "manager", "staff"), itemController.renderNewItem);
router.post(
  "/",
  allowRoles("admin", "manager", "staff"),
  imageUpload.single("image"),
  itemValidator,
  validateMiddleware,
  itemController.createItem
);
router.get("/:id", itemController.getItemDetail);
router.get("/:id/edit", allowRoles("admin", "manager", "staff"), itemController.renderEditItem);
router.put(
  "/:id",
  allowRoles("admin", "manager", "staff"),
  imageUpload.single("image"),
  itemValidator,
  validateMiddleware,
  itemController.updateItem
);
router.delete("/:id", allowRoles("admin"), itemController.deleteItem);

module.exports = router;
