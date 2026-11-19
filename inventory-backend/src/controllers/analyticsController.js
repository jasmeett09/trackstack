const asyncHandler = require("../utils/asyncHandler");
const analyticsService = require("../services/analyticsService");

exports.apiDashboardAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getDashboardAnalytics(req.user._id);
  res.json(analytics);
});
