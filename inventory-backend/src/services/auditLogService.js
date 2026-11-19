const ActivityLog = require("../models/ActivityLog");
const InventoryLog = require("../models/InventoryLog");

const normalizeId = (value) => (value ? value.toString() : null);

const logActivity = async ({ organizationId, userId, action, entity, details = {} }) =>
  ActivityLog.create({
    organizationId: normalizeId(organizationId),
    user: normalizeId(userId) || "system",
    action,
    entity,
    details
  });

const logInventoryChange = async ({
  itemId,
  userId,
  organizationId,
  action,
  oldQuantity,
  newQuantity,
  metadata = {}
}) =>
  InventoryLog.create({
    organizationId: normalizeId(organizationId),
    itemId: normalizeId(itemId),
    userId: normalizeId(userId) || "system",
    action,
    oldQuantity,
    newQuantity,
    metadata
  });

module.exports = {
  logActivity,
  logInventoryChange
};
