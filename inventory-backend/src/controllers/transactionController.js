const asyncHandler = require("../utils/asyncHandler");
const itemService = require("../services/itemService");
const transactionService = require("../services/transactionService");
const { emitToOrganization } = require("../config/socket");

exports.listTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionService.getAllTransactions(req.user._id);

  res.render("transactions/list", {
    title: "Transactions",
    transactions
  });
});

exports.renderNewTransaction = asyncHandler(async (req, res) => {
  const items = await itemService.getItemOptions(req.user._id);
  res.render("transactions/add", {
    title: "Add Transaction",
    items
  });
});

exports.createTransaction = asyncHandler(async (req, res) => {
  const result = await transactionService.createTransactionAndUpdateStock({
    itemId: req.body.item,
    transactionType: req.body.transactionType,
    quantity: Number(req.body.quantity),
    note: req.body.note,
    userId: req.user._id
  });

  emitToOrganization(req.user.organizationId, "stock:update", {
    organizationId: req.user.organizationId,
    itemId: result.item._id,
    itemName: result.item.name,
    quantity: result.item.quantity,
    transactionType: req.body.transactionType,
    changedBy: req.user.name,
    source: "transaction"
  });

  req.flash("success_msg", "Transaction recorded successfully.");
  res.redirect("/transactions");
});

exports.apiListTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionService.getAllTransactions(req.user._id);

  res.json(transactions);
});

exports.apiCreateTransaction = asyncHandler(async (req, res) => {
  const result = await transactionService.createTransactionAndUpdateStock({
    itemId: req.body.item,
    transactionType: req.body.transactionType,
    quantity: Number(req.body.quantity),
    note: req.body.note,
    userId: req.user._id
  });

  emitToOrganization(req.user.organizationId, "stock:update", {
      organizationId: req.user.organizationId,
      itemId: result.item._id,
      itemName: result.item.name,
      quantity: result.item.quantity,
      transactionType: req.body.transactionType,
      changedBy: req.user.name,
      source: "transaction"
    });

  res.status(201).json({
    message: "Transaction recorded successfully.",
    transaction: result.transaction
  });
});
