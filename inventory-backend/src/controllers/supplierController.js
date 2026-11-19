const supplierService = require("../services/supplierService");
const asyncHandler = require("../utils/asyncHandler");

exports.listSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getAllSuppliers(req.user._id);
  res.render("suppliers/list", {
    title: "Suppliers",
    suppliers
  });
});

exports.renderNewSupplier = (req, res) => {
  res.render("suppliers/add", {
    title: "Add Supplier"
  });
};

exports.createSupplier = asyncHandler(async (req, res) => {
  await supplierService.createSupplier(req.user._id, req.body);

  req.flash("success_msg", "Supplier created successfully.");
  res.redirect("/suppliers");
});

exports.renderEditSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.id, req.user._id);

  if (!supplier) {
    const error = new Error("Supplier not found.");
    error.statusCode = 404;
    throw error;
  }

  res.render("suppliers/edit", {
    title: "Edit Supplier",
    supplier
  });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.user._id, req.body);

  if (!supplier) {
    const error = new Error("Supplier not found.");
    error.statusCode = 404;
    throw error;
  }

  req.flash("success_msg", "Supplier updated successfully.");
  res.redirect("/suppliers");
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.deleteSupplier(req.params.id, req.user._id);

  if (!supplier) {
    const error = new Error("Supplier not found.");
    error.statusCode = 404;
    throw error;
  }

  req.flash("success_msg", "Supplier deleted successfully.");
  res.redirect("/suppliers");
});

exports.apiListSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getAllSuppliers(req.user._id);
  res.json(suppliers);
});

exports.apiCreateSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.user._id, req.body);

  res.status(201).json({
    message: "Supplier created successfully.",
    supplier
  });
});
