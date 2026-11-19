const Notification = require("../models/Notification");
const { emitToOrganization } = require("../config/socket");
const { mapNotification } = require("../utils/prismaSerializers");
const { getTenantContext } = require("./tenantService");

const normalizeUserId = (value) => (value ? value.toString() : "");

const createNotification = async ({
  organizationId,
  actorUserId = null,
  type,
  title,
  message,
  entity = "",
  entityId = "",
  metadata = {}
}) => {
  const notification = await Notification.create({
    organizationId: organizationId.toString(),
    actorUserId: actorUserId ? actorUserId.toString() : null,
    type,
    title,
    message,
    entity,
    entityId: entityId ? entityId.toString() : "",
    metadata
  });

  const payload = mapNotification(notification);
  emitToOrganization(organizationId, "notification:new", payload);
  return payload;
};

const getOrganizationNotifications = async (userId, { limit = 20, unreadOnly = false } = {}) => {
  const tenant = await getTenantContext(userId);
  const normalizedUserId = normalizeUserId(tenant.userId);

  const query = {
    organizationId: tenant.organizationId
  };

  if (unreadOnly) {
    query.readBy = { $ne: normalizedUserId };
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({
    organizationId: tenant.organizationId,
    readBy: { $ne: normalizedUserId }
  });

  return {
    notifications: notifications.map((notification) => mapNotification(notification, normalizedUserId)),
    unreadCount
  };
};

const markNotificationAsRead = async (userId, notificationId) => {
  const tenant = await getTenantContext(userId);
  const normalizedUserId = normalizeUserId(tenant.userId);

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      organizationId: tenant.organizationId
    },
    {
      $addToSet: { readBy: normalizedUserId }
    },
    {
      new: true
    }
  ).lean();

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }

  const unreadCount = await Notification.countDocuments({
    organizationId: tenant.organizationId,
    readBy: { $ne: normalizedUserId }
  });

  const payload = {
    notification: mapNotification(notification, normalizedUserId),
    unreadCount,
    userId: normalizedUserId
  };

  emitToOrganization(tenant.organizationId, "notification:updated", payload);
  return payload;
};

const markAllNotificationsAsRead = async (userId) => {
  const tenant = await getTenantContext(userId);
  const normalizedUserId = normalizeUserId(tenant.userId);

  await Notification.updateMany(
    {
      organizationId: tenant.organizationId,
      readBy: { $ne: normalizedUserId }
    },
    {
      $addToSet: { readBy: normalizedUserId }
    }
  );

  const unreadCount = await Notification.countDocuments({
    organizationId: tenant.organizationId,
    readBy: { $ne: normalizedUserId }
  });

  const payload = {
    unreadCount,
    userId: normalizedUserId
  };
  emitToOrganization(tenant.organizationId, "notification:all-read", payload);
  return payload;
};

module.exports = {
  createNotification,
  getOrganizationNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
