const analyticsService = require("../services/analyticsService");
const asyncHandler = require("../utils/asyncHandler");
const categoryService = require("../services/categoryService");
const itemService = require("../services/itemService");
const purchaseService = require("../services/purchaseService");
const saleService = require("../services/saleService");
const supplierService = require("../services/supplierService");
const transactionService = require("../services/transactionService");
const { buildOpenApiSpec, groupedEndpoints } = require("../config/openapi");

exports.renderHome = (req, res) => {
  res.render("home", {
    title: "Inventory Management System"
  });
};

exports.renderRegister = (req, res) => {
  res.render("register", {
    title: "Register"
  });
};

exports.renderLogin = (req, res) => {
  res.render("login", {
    title: "Login"
  });
};

exports.renderDashboard = asyncHandler(async (req, res) => {
  const [analytics, recentTransactions] = await Promise.all([
    analyticsService.getDashboardAnalytics(req.user._id),
    transactionService.getRecentTransactions(req.user._id, 5)
  ]);

  res.render("dashboard", {
    title: "Dashboard",
    stats: analytics.stats,
    lowStockItems: analytics.lowStockItems,
    topSellingProducts: analytics.topSellingProducts,
    recentActivity: analytics.recentActivity,
    recentTransactions
  });
});

exports.renderDocs = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.render("docs", {
    title: "API Docs",
    apiSpecUrl: "/api/docs.json",
    groupedEndpoints,
    spec: buildOpenApiSpec(baseUrl)
  });
};
