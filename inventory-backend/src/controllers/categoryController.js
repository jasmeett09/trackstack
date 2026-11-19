const categoryService = require("../services/categoryService");
const asyncHandler = require("../utils/asyncHandler");

exports.listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.user._id);
  res.render("categories/list", {
    title: "Categories",
    categories
  });
});

exports.renderNewCategory = (req, res) => {
  res.render("categories/add", {
    title: "Add Category"
  });
};

exports.createCategory = asyncHandler(async (req, res) => {
  await categoryService.createCategory(req.user._id, req.body);

  req.flash("success_msg", "Category created successfully.");
  res.redirect("/categories");
});

exports.renderEditCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id, req.user._id);

  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  res.render("categories/edit", {
    title: "Edit Category",
    category
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.user._id, req.body);

  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  req.flash("success_msg", "Category updated successfully.");
  res.redirect("/categories");
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id, req.user._id);

  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  req.flash("success_msg", "Category deleted successfully.");
  res.redirect("/categories");
});

exports.apiListCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.user._id);
  res.json(categories);
});

exports.apiCreateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user._id, req.body);

  res.status(201).json({
    message: "Category created successfully.",
    category
  });
});
