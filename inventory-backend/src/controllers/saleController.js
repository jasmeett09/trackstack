const asyncHandler = require("../utils/asyncHandler");
const itemService = require("../services/itemService");
const saleService = require("../services/saleService");
const { emitToOrganization } = require("../config/socket");

exports.listSales = asyncHandler(async (req, res) => {
  const sales = await saleService.getAllSales(req.user._id);

  res.render("sales/list", {
    title: "Sales",
    sales
  });
});

exports.renderNewSale = asyncHandler(async (req, res) => {
  const items = await itemService.getItemOptions(req.user._id);

  res.render("sales/add", {
    title: "Add Sale",
    items
  });
});

exports.createSale = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale({
    itemId: req.body.item,
    customerName: req.body.customerName,
    quantity: Number(req.body.quantity),
    sellingPrice: Number(req.body.sellingPrice),
    note: req.body.note,
    userId: req.user._id
  });

  if (sale.item) {
    emitToOrganization(req.user.organizationId, "stock:update", {
      organizationId: req.user.organizationId,
      itemId: sale.item._id,
      itemName: sale.item.name,
      quantity: sale.item.quantity,
      transactionType: "stock-out",
      changedBy: req.user.name,
      source: "sale"
    });
  }

  req.flash("success_msg", "Sale recorded successfully.");
  res.redirect("/sales");
});

exports.apiListSales = asyncHandler(async (req, res) => {
  const sales = await saleService.getAllSales(req.user._id);
  res.json(sales);
});

exports.apiCreateSale = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale({
    itemId: req.body.item,
    customerName: req.body.customerName,
    quantity: Number(req.body.quantity),
    sellingPrice: Number(req.body.sellingPrice),
    note: req.body.note,
    userId: req.user._id
  });

  if (sale.item) {
    emitToOrganization(req.user.organizationId, "stock:update", {
      organizationId: req.user.organizationId,
      itemId: sale.item._id,
      itemName: sale.item.name,
      quantity: sale.item.quantity,
      transactionType: "stock-out",
      changedBy: req.user.name,
      source: "sale"
    });
  }

  res.status(201).json({
    message: "Sale recorded successfully.",
    sale
  });
});
