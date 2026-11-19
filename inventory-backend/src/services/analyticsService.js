const ActivityLog = require("../models/ActivityLog");
const { prisma } = require("../config/prisma");
const { mapActivityLog } = require("../utils/prismaSerializers");
const { getTenantContext } = require("./tenantService");
const { LOW_STOCK_THRESHOLD } = require("../constants/inventory");

const buildMonthKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const getMonthlySales = async (userId, months = 6) => {
  const { organizationId } = await getTenantContext(userId);
  const sales = await prisma.sale.findMany({
    where: { organizationId },
    select: {
      quantity: true,
      sellingPrice: true,
      saleDate: true
    },
    orderBy: { saleDate: "asc" }
  });

  const now = new Date();
  const buckets = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    buckets.push({
      key: buildMonthKey(bucketDate),
      label: bucketDate.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      salesCount: 0,
      unitsSold: 0,
      revenue: 0
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sales.forEach((sale) => {
    const key = buildMonthKey(new Date(sale.saleDate));
    const bucket = bucketMap.get(key);

    if (!bucket) {
      return;
    }

    bucket.salesCount += 1;
    bucket.unitsSold += sale.quantity;
    bucket.revenue += sale.quantity * sale.sellingPrice;
  });

  return buckets;
};

const getTopSellingProducts = async (userId, limit = 5) => {
  const { organizationId } = await getTenantContext(userId);
  const sales = await prisma.sale.findMany({
    where: { organizationId },
    include: {
      item: true
    }
  });

  const totals = new Map();

  sales.forEach((sale) => {
    const entry = totals.get(sale.itemId) || {
      itemId: sale.itemId,
      itemName: sale.item?.name || "Deleted Item",
      unitsSold: 0,
      revenue: 0
    };

    entry.unitsSold += sale.quantity;
    entry.revenue += sale.quantity * sale.sellingPrice;
    totals.set(sale.itemId, entry);
  });

  return [...totals.values()]
    .sort((first, second) => second.unitsSold - first.unitsSold || second.revenue - first.revenue)
    .slice(0, limit);
};

const getRecentActivity = async (userId, limit = 8) => {
  const { organizationId } = await getTenantContext(userId);
  const logs = await ActivityLog.find({ organizationId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return logs.map(mapActivityLog);
};

const getDashboardAnalytics = async (userId) => {
  const { organizationId } = await getTenantContext(userId);

  const [items, totalCategories, totalSuppliers, totalPurchases, totalSales, topSellingProducts, monthlySales, recentActivity] =
    await Promise.all([
      prisma.item.findMany({
        where: { organizationId },
        include: {
          category: true,
          supplier: true
        },
        orderBy: { quantity: "asc" }
      }),
      prisma.category.count({ where: { organizationId } }),
      prisma.supplier.count({ where: { organizationId } }),
      prisma.purchase.count({ where: { organizationId } }),
      prisma.sale.count({ where: { organizationId } }),
      getTopSellingProducts(userId),
      getMonthlySales(userId),
      getRecentActivity(userId)
    ]);

  const lowStockItems = items
    .filter((item) => item.quantity < LOW_STOCK_THRESHOLD)
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      reorderLevel: LOW_STOCK_THRESHOLD,
      unit: item.unit,
      categoryName: item.category?.name || "N/A"
    }));

  const totalInventoryValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalRevenue = monthlySales.reduce((sum, month) => sum + month.revenue, 0);

  const purchaseSpendRows = await prisma.purchase.findMany({
    where: { organizationId },
    select: {
      quantity: true,
      purchasePrice: true
    }
  });

  const totalPurchaseCost = purchaseSpendRows.reduce(
    (sum, purchase) => sum + purchase.quantity * purchase.purchasePrice,
    0
  );

  return {
    stats: {
      totalItems: items.length,
      totalCategories,
      totalSuppliers,
      totalPurchases,
      totalSales,
      lowStockCount: lowStockItems.length,
      totalInventoryValue,
      totalRevenue,
      totalPurchaseCost,
      grossProfit: totalRevenue - totalPurchaseCost
    },
    lowStockItems,
    topSellingProducts,
    monthlySales,
    recentActivity
  };
};

module.exports = {
  getDashboardAnalytics,
  getMonthlySales,
  getTopSellingProducts,
  getRecentActivity
};
