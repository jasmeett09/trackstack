const categoryService = require("../services/categoryService");
const itemService = require("../services/itemService");
const supplierService = require("../services/supplierService");
const asyncHandler = require("../utils/asyncHandler");
const { emitToOrganization } = require("../config/socket");
const { LOW_STOCK_THRESHOLD } = require("../constants/inventory");

const getItemFormData = async (userId) => {
  const [categories, suppliers] = await Promise.all([
    categoryService.getCategoryOptions(userId),
    supplierService.getSupplierOptions(userId)
  ]);

  return { categories, suppliers };
};

exports.listItems = asyncHandler(async (req, res) => {
  const items = await itemService.getAllItems(req.user._id);
  res.render("items/list", {
    title: "Items",
    items
  });
});

exports.renderNewItem = asyncHandler(async (req, res) => {
  const { categories, suppliers } = await getItemFormData(req.user._id);
  res.render("items/add", {
    title: "Add Item",
    categories,
    suppliers
  });
});

exports.createItem = asyncHandler(async (req, res) => {
  const item = await itemService.createItem({
    name: req.body.name,
    category: req.body.category,
    quantity: Number(req.body.quantity),
    reorderLevel: LOW_STOCK_THRESHOLD,
    unit: req.body.unit,
    supplier: req.body.supplier,
    price: Number(req.body.price),
    description: req.body.description,
    imageUrl: req.file ? req.file.path : null,
    user: req.user._id
  });

  emitToOrganization(req.user.organizationId, "inventory:item.changed", {
    organizationId: req.user.organizationId,
    action: "created",
    itemId: item._id,
    itemName: item.name,
    changedBy: req.user.name
  });

  req.flash("success_msg", "Item created successfully.");
  res.redirect("/items");
});

exports.getItemDetail = asyncHandler(async (req, res) => {
  const item = await itemService.getItemById(req.params.id, req.user._id);

  if (!item) {
    const error = new Error("Item not found.");
    error.statusCode = 404;
    throw error;
  }

  res.render("items/detail", {
    title: "Item Detail",
    item
  });
});

exports.renderEditItem = asyncHandler(async (req, res) => {
  const [item, { categories, suppliers }] = await Promise.all([
    itemService.getItemById(req.params.id, req.user._id),
    getItemFormData(req.user._id)
  ]);

  if (!item) {
    const error = new Error("Item not found.");
    error.statusCode = 404;
    throw error;
  }

  res.render("items/edit", {
    title: "Edit Item",
    item,
    categories,
    suppliers
  });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.params.id, req.user._id, {
    name: req.body.name,
    category: req.body.category,
    quantity: Number(req.body.quantity),
    reorderLevel: LOW_STOCK_THRESHOLD,
    unit: req.body.unit,
    supplier: req.body.supplier,
    price: Number(req.body.price),
    description: req.body.description,
    ...(req.file ? { imageUrl: req.file.path } : {})
  });

  if (!item) {
    const error = new Error("Item not found.");
    error.statusCode = 404;
    throw error;
  }

  emitToOrganization(req.user.organizationId, "inventory:item.changed", {
    organizationId: req.user.organizationId,
    action: "updated",
    itemId: item._id,
    itemName: item.name,
    changedBy: req.user.name
  });

  req.flash("success_msg", "Item updated successfully.");
  res.redirect("/items");
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const deletedItem = await itemService.deleteItem(req.params.id, req.user._id);

  if (!deletedItem) {
    const error = new Error("Item not found.");
    error.statusCode = 404;
    throw error;
  }

  emitToOrganization(req.user.organizationId, "inventory:item.changed", {
    organizationId: req.user.organizationId,
    action: "deleted",
    itemId: deletedItem._id,
    itemName: deletedItem.name,
    changedBy: req.user.name
  });

  req.flash("success_msg", "Item deleted successfully.");
  res.redirect("/items");
});

exports.apiListItems = asyncHandler(async (req, res) => {
  const items = await itemService.getAllItems(req.user._id);
  res.json(items);
});

exports.apiGetItem = asyncHandler(async (req, res) => {
  const item = await itemService.getItemById(req.params.id, req.user._id);

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  return res.json(item);
});

exports.apiCreateItem = asyncHandler(async (req, res) => {
  const item = await itemService.createItem({
    name: req.body.name,
    category: req.body.category,
    quantity: Number(req.body.quantity),
    reorderLevel: LOW_STOCK_THRESHOLD,
    unit: req.body.unit,
    supplier: req.body.supplier,
    price: Number(req.body.price),
    description: req.body.description,
    imageUrl: req.file ? req.file.path : null,
    user: req.user._id
  });

  emitToOrganization(req.user.organizationId, "inventory:item.changed", {
    organizationId: req.user.organizationId,
    action: "created",
    itemId: item._id,
    itemName: item.name,
    changedBy: req.user.name
  });

  res.status(201).json({
    message: "Item created successfully.",
    item
  });
});

exports.apiUpdateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.params.id, req.user._id, {
    name: req.body.name,
    category: req.body.category,
    quantity: Number(req.body.quantity),
    reorderLevel: LOW_STOCK_THRESHOLD,
    unit: req.body.unit,
    supplier: req.body.supplier,
    price: Number(req.body.price),
    description: req.body.description,
    ...(req.file ? { imageUrl: req.file.path } : {})
  });

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  emitToOrganization(req.user.organizationId, "inventory:item.changed", {
    organizationId: req.user.organizationId,
    action: "updated",
    itemId: item._id,
    itemName: item.name,
    changedBy: req.user.name
  });

  res.json({
    message: "Item updated successfully.",
    item
  });
});

exports.apiDeleteItem = asyncHandler(async (req, res) => {
  const item = await itemService.deleteItem(req.params.id, req.user._id);

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  emitToOrganization(req.user.organizationId, "inventory:item.changed", {
    organizationId: req.user.organizationId,
    action: "deleted",
    itemId: item._id,
    itemName: item.name,
    changedBy: req.user.name
  });

  res.json({ message: "Item deleted successfully." });
});
