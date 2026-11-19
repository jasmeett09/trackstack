const { prisma } = require("../config/prisma");
const { getTenantContext } = require("./tenantService");
const { LOW_STOCK_THRESHOLD } = require("../constants/inventory");

const formatDateTime = (value) => new Date(value).toLocaleString("en-US");
const formatDate = (value) => new Date(value).toLocaleDateString("en-US");
const formatMoney = (value) => Number(value || 0).toFixed(2);

const escapeCsv = (value) => {
  const stringValue = value == null ? "" : String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const createCsvBuffer = (rows) => {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  return Buffer.from(csv, "utf8");
};

const escapePdfText = (value) => String(value || "")
  .replace(/\\/g, "\\\\")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)")
  .replace(/[^\x20-\x7E]/g, "");

const createSimplePdfBuffer = (lines) => {
  const pageHeight = 792;
  const pageWidth = 612;
  const fontSize = 12;
  const leading = 18;
  const startX = 48;
  let currentY = 740;
  let content = "BT\n/F1 12 Tf\n";

  lines.forEach((line) => {
    if (currentY < 60) {
      currentY = 740;
    }

    content += `1 0 0 1 ${startX} ${currentY} Tm (${escapePdfText(line)}) Tj\n`;
    currentY -= leading;
  });

  content += "ET";
  const contentBuffer = Buffer.from(content, "utf8");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`,
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${contentBuffer.length} >> stream\n${content}\nendstream endobj`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
};

const getInventoryPdfExport = async (userId) => {
  const { organizationId, user } = await getTenantContext(userId);

  const items = await prisma.item.findMany({
    where: { organizationId },
    include: {
      category: true,
      supplier: true
    },
    orderBy: [
      { quantity: "asc" },
      { name: "asc" }
    ]
  });

  const lowStockItems = items.filter((item) => item.quantity < LOW_STOCK_THRESHOLD);
  const totalInventoryValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  const lines = [
    "Inventory Management System - Inventory Report",
    `Organization: ${user.organization?.organizationName || organizationId}`,
    `Generated: ${formatDateTime(new Date())}`,
    "",
    `Total Items: ${items.length}`,
    `Total Units In Stock: ${totalUnits}`,
    `Low Stock Items: ${lowStockItems.length}`,
    `Total Inventory Value: $${formatMoney(totalInventoryValue)}`,
    "",
    "Item Details:"
  ];

  items.slice(0, 28).forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} | Qty: ${item.quantity} ${item.unit} | Threshold: ${LOW_STOCK_THRESHOLD} | Price: $${formatMoney(item.price)} | Category: ${item.category?.name || "N/A"} | Supplier: ${item.supplier?.name || "N/A"}`
    );
  });

  if (items.length > 28) {
    lines.push(`...and ${items.length - 28} more items in the organization inventory.`);
  }

  if (lowStockItems.length) {
    lines.push("");
    lines.push("Low Stock Summary:");
    lowStockItems.slice(0, 10).forEach((item) => {
      lines.push(`- ${item.name}: ${item.quantity} ${item.unit} remaining`);
    });
  }

  return {
    fileName: `inventory-report-${formatDate(new Date()).replace(/\//g, "-")}.pdf`,
    buffer: createSimplePdfBuffer(lines)
  };
};

const getSalesCsvExport = async (userId) => {
  const { organizationId } = await getTenantContext(userId);

  const sales = await prisma.sale.findMany({
    where: { organizationId },
    include: {
      item: true
    },
    orderBy: { saleDate: "desc" }
  });

  const rows = [
    ["Sale ID", "Date", "Item", "Customer", "Quantity", "Selling Price", "Revenue", "Note"]
  ];

  sales.forEach((sale) => {
    rows.push([
      sale.id,
      formatDateTime(sale.saleDate),
      sale.item?.name || "Deleted Item",
      sale.customerName || "",
      sale.quantity,
      formatMoney(sale.sellingPrice),
      formatMoney(sale.quantity * sale.sellingPrice),
      sale.note || ""
    ]);
  });

  return {
    fileName: `sales-report-${formatDate(new Date()).replace(/\//g, "-")}.csv`,
    buffer: createCsvBuffer(rows)
  };
};

const getPurchasesCsvExport = async (userId) => {
  const { organizationId } = await getTenantContext(userId);

  const purchases = await prisma.purchase.findMany({
    where: { organizationId },
    include: {
      item: true,
      supplier: true
    },
    orderBy: { purchaseDate: "desc" }
  });

  const rows = [
    ["Purchase ID", "Date", "Item", "Supplier", "Quantity", "Purchase Price", "Total Cost", "Note"]
  ];

  purchases.forEach((purchase) => {
    rows.push([
      purchase.id,
      formatDateTime(purchase.purchaseDate),
      purchase.item?.name || "Deleted Item",
      purchase.supplier?.name || "Unknown Supplier",
      purchase.quantity,
      formatMoney(purchase.purchasePrice),
      formatMoney(purchase.quantity * purchase.purchasePrice),
      purchase.note || ""
    ]);
  });

  return {
    fileName: `purchase-report-${formatDate(new Date()).replace(/\//g, "-")}.csv`,
    buffer: createCsvBuffer(rows)
  };
};

module.exports = {
  getInventoryPdfExport,
  getSalesCsvExport,
  getPurchasesCsvExport
};
