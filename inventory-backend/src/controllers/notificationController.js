const asyncHandler = require("../utils/asyncHandler");
const notificationService = require("../services/notificationService");

exports.apiListNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === "true";
  const limit = Number(req.query.limit || 20);
  const data = await notificationService.getOrganizationNotifications(req.user._id || req.user.id, {
    limit,
    unreadOnly
  });

  res.json(data);
});

exports.apiMarkNotificationRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markNotificationAsRead(
    req.user._id || req.user.id,
    req.params.notificationId
  );

  res.json({
    message: "Notification marked as read.",
    ...result
  });
});

exports.apiMarkAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsAsRead(req.user._id || req.user.id);

  res.json({
    message: "All notifications marked as read.",
    ...result
  });
});
