const asyncHandler = require("../utils/asyncHandler");
const reportExportService = require("../services/reportExportService");

exports.apiExportInventoryPdf = asyncHandler(async (req, res) => {
  const { fileName, buffer } = await reportExportService.getInventoryPdfExport(req.user._id || req.user.id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(buffer);
});

exports.apiExportSalesCsv = asyncHandler(async (req, res) => {
  const { fileName, buffer } = await reportExportService.getSalesCsvExport(req.user._id || req.user.id);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(buffer);
});

exports.apiExportPurchasesCsv = asyncHandler(async (req, res) => {
  const { fileName, buffer } = await reportExportService.getPurchasesCsvExport(req.user._id || req.user.id);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(buffer);
});
