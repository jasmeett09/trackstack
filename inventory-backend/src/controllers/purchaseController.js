const asyncHandler = require("../utils/asyncHandler");
const itemService = require("../services/itemService");
const supplierService = require("../services/supplierService");
const purchaseService = require("../services/purchaseService");
const { emitToOrganization } = require("../config/socket");

const getFormData = async (userId) => {
  const [items, suppliers] = await Promise.all([
    itemService.getItemOptions(userId),
    supplierService.getSupplierOptions(userId)
  ]);

  return { items, suppliers };
};

exports.listPurchases = asyncHandler(async (req, res) => {
  const purchases = await purchaseService.getAllPurchases(req.user._id);

  res.render("purchases/list", {
    title: "Purchases",
    purchases
  });
});

exports.renderNewPurchase = asyncHandler(async (req, res) => {
  const { items, suppliers } = await getFormData(req.user._id);

  res.render("purchases/add", {
    title: "Add Purchase",
    items,
    suppliers
  });
});

exports.createPurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchase({
    itemId: req.body.item,
    supplierId: req.body.supplier,
    quantity: Number(req.body.quantity),
    purchasePrice: Number(req.body.purchasePrice),
    note: req.body.note,
    userId: req.user._id
  });

  if (purchase.item) {
    emitToOrganization(req.user.organizationId, "stock:update", {
      organizationId: req.user.organizationId,
      itemId: purchase.item._id,
      itemName: purchase.item.name,
      quantity: purchase.item.quantity,
      transactionType: "stock-in",
      changedBy: req.user.name,
      source: "purchase"
    });
  }

  req.flash("success_msg", "Purchase recorded successfully.");
  res.redirect("/purchases");
});

exports.apiListPurchases = asyncHandler(async (req, res) => {
  const purchases = await purchaseService.getAllPurchases(req.user._id);
  res.json(purchases);
});

exports.apiCreatePurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchase({
    itemId: req.body.item,
    supplierId: req.body.supplier,
    quantity: Number(req.body.quantity),
    purchasePrice: Number(req.body.purchasePrice),
    note: req.body.note,
    userId: req.user._id
  });

  if (purchase.item) {
    emitToOrganization(req.user.organizationId, "stock:update", {
      organizationId: req.user.organizationId,
      itemId: purchase.item._id,
      itemName: purchase.item.name,
      quantity: purchase.item.quantity,
      transactionType: "stock-in",
      changedBy: req.user.name,
      source: "purchase"
    });
  }

  res.status(201).json({
    message: "Purchase recorded successfully.",
    purchase
  });
});
