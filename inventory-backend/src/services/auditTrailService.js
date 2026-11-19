const ActivityLog = require("../models/ActivityLog");
const InventoryLog = require("../models/InventoryLog");
const { mapActivityLog, mapInventoryLog } = require("../utils/prismaSerializers");
const { getTenantContext } = require("./tenantService");

const getOrganizationActivityLogs = async (userId, limit = 25) => {
  const { organizationId } = await getTenantContext(userId);
  const logs = await ActivityLog.find({ organizationId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return logs.map(mapActivityLog);
};

const getOrganizationInventoryLogs = async (userId, limit = 25) => {
  const { organizationId } = await getTenantContext(userId);
  const logs = await InventoryLog.find({ organizationId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return logs.map(mapInventoryLog);
};

module.exports = {
  getOrganizationActivityLogs,
  getOrganizationInventoryLogs
};
