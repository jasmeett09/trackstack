const express = require("express");
const authController = require("../controllers/authController");
const analyticsController = require("../controllers/analyticsController");
const categoryController = require("../controllers/categoryController");
const itemController = require("../controllers/itemController");
const notificationController = require("../controllers/notificationController");
const organizationController = require("../controllers/organizationController");
const reportController = require("../controllers/reportController");
const { imageUpload } = require("../config/cloudinary");
const supplierController = require("../controllers/supplierController");
const transactionController = require("../controllers/transactionController");
const { ensureJwtAuth } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/authorizationMiddleware");
const sessionAuthMiddleware = require("../middlewares/sessionAuthMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");
const categoryValidator = require("../validators/categoryValidator");
const itemValidator = require("../validators/itemValidator");
const supplierValidator = require("../validators/supplierValidator");
const transactionValidator = require("../validators/transactionValidator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const { authLimiter } = require("../config/security");
const purchaseController = require("../controllers/purchaseController");
const saleController = require("../controllers/saleController");
const purchaseValidator = require("../validators/purchaseValidator");
const saleValidator = require("../validators/saleValidator");
const {
  acceptInvitationValidator,
  inviteUserValidator,
  updateOrganizationUserRoleValidator,
  updateProfileValidator,
  updateOrganizationSettingsValidator
} = require("../validators/organizationValidator");

const router = express.Router();

router.get("/docs.json", organizationController.apiDocs);
router.post(
  "/auth/register",
  authLimiter,
  registerValidator,
  validateMiddleware,
  authController.apiRegister
);
router.get("/auth/invitations/:invitationId", organizationController.apiInvitationDetails);
router.post(
  "/auth/accept-invitation",
  authLimiter,
  acceptInvitationValidator,
  validateMiddleware,
  authController.apiAcceptInvitation
);
router.post(
  "/auth/login",
  authLimiter,
  loginValidator,
  validateMiddleware,
  authController.apiLogin
);
router.post("/auth/logout", sessionAuthMiddleware, authController.apiLogout);
router.get("/session/profile", sessionAuthMiddleware, authController.apiSessionProfile);
router.put(
  "/session/profile",
  sessionAuthMiddleware,
  updateProfileValidator,
  validateMiddleware,
  authController.apiUpdateSessionProfile
);
router.get("/notifications", sessionAuthMiddleware, notificationController.apiListNotifications);
router.patch(
  "/notifications/:notificationId/read",
  sessionAuthMiddleware,
  notificationController.apiMarkNotificationRead
);
router.patch(
  "/notifications/read-all",
  sessionAuthMiddleware,
  notificationController.apiMarkAllNotificationsRead
);
router.get("/organization", sessionAuthMiddleware, organizationController.apiOrganizationSummary);
router.put(
  "/organization",
  sessionAuthMiddleware,
  allowRoles("admin"),
  updateOrganizationSettingsValidator,
  validateMiddleware,
  organizationController.apiUpdateOrganizationSettings
);
router.get(
  "/organization/users",
  sessionAuthMiddleware,
  allowRoles("admin"),
  organizationController.apiOrganizationUsers
);
router.get(
  "/organization/invitations",
  sessionAuthMiddleware,
  allowRoles("admin"),
  organizationController.apiOrganizationInvitations
);
router.get(
  "/organization/activity",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  organizationController.apiOrganizationActivityLogs
);
router.get(
  "/organization/inventory-logs",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  organizationController.apiOrganizationInventoryLogs
);
router.post(
  "/organization/invitations",
  sessionAuthMiddleware,
  allowRoles("admin"),
  inviteUserValidator,
  validateMiddleware,
  organizationController.apiInviteUser
);
router.put(
  "/organization/users/:userId/role",
  sessionAuthMiddleware,
  allowRoles("admin"),
  updateOrganizationUserRoleValidator,
  validateMiddleware,
  organizationController.apiUpdateOrganizationUserRole
);
router.delete(
  "/organization/users/:userId",
  sessionAuthMiddleware,
  allowRoles("admin"),
  organizationController.apiRemoveOrganizationUser
);
router.delete(
  "/organization/invitations/:invitationId",
  sessionAuthMiddleware,
  allowRoles("admin"),
  organizationController.apiRevokeInvitation
);

router.get("/items", sessionAuthMiddleware, itemController.apiListItems);
router.get("/items/:id", sessionAuthMiddleware, itemController.apiGetItem);
router.post(
  "/items",
  sessionAuthMiddleware,
  allowRoles("admin", "manager", "staff"),
  imageUpload.single("image"),
  itemValidator,
  validateMiddleware,
  itemController.apiCreateItem
);
router.put(
  "/items/:id",
  sessionAuthMiddleware,
  allowRoles("admin", "manager", "staff"),
  imageUpload.single("image"),
  itemValidator,
  validateMiddleware,
  itemController.apiUpdateItem
);
router.delete("/items/:id", sessionAuthMiddleware, allowRoles("admin"), itemController.apiDeleteItem);

router.get("/categories", sessionAuthMiddleware, categoryController.apiListCategories);
router.post(
  "/categories",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  categoryValidator,
  validateMiddleware,
  categoryController.apiCreateCategory
);

router.get("/suppliers", sessionAuthMiddleware, supplierController.apiListSuppliers);
router.post(
  "/suppliers",
  sessionAuthMiddleware,
  allowRoles("admin"),
  supplierValidator,
  validateMiddleware,
  supplierController.apiCreateSupplier
);

router.get("/transactions", sessionAuthMiddleware, transactionController.apiListTransactions);
router.post(
  "/transactions",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  transactionValidator,
  validateMiddleware,
  transactionController.apiCreateTransaction
);

router.get("/purchases", sessionAuthMiddleware, purchaseController.apiListPurchases);
router.post(
  "/purchases",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  purchaseValidator,
  validateMiddleware,
  purchaseController.apiCreatePurchase
);

router.get("/sales", sessionAuthMiddleware, saleController.apiListSales);
router.post(
  "/sales",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  saleValidator,
  validateMiddleware,
  saleController.apiCreateSale
);

router.get("/analytics/dashboard", sessionAuthMiddleware, analyticsController.apiDashboardAnalytics);
router.get(
  "/reports/export/inventory-pdf",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  reportController.apiExportInventoryPdf
);
router.get(
  "/reports/export/sales-csv",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  reportController.apiExportSalesCsv
);
router.get(
  "/reports/export/purchases-csv",
  sessionAuthMiddleware,
  allowRoles("admin", "manager"),
  reportController.apiExportPurchasesCsv
);

router.get("/profile", ensureJwtAuth, (req, res) => {
  res.json({
    message: "Protected profile data using JWT.",
    user: req.apiUser
  });
});

module.exports = router;
