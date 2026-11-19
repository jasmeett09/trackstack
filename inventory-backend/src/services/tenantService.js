const { prisma } = require("../config/prisma");
const authService = require("./authService");

const getTenantContext = async (userId) => {
  const user = await authService.getUserById(userId.toString());

  if (!user) {
    const error = new Error("Authenticated user was not found.");
    error.statusCode = 401;
    throw error;
  }

  return {
    user,
    userId: user.id || user._id,
    organizationId: user.organizationId
  };
};

const attachUsersById = async (records, key = "userId") => {
  const userIds = [...new Set(records.map((record) => record[key]))].filter(Boolean);

  if (!userIds.length) {
    return records.map((record) => ({
      ...record,
      performedBy: null
    }));
  }

  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds }
    },
    include: {
      organization: true
    }
  });

  const userMap = new Map(
    users.map((user) => [user.id, authService.decorateUser(user)])
  );

  return records.map((record) => ({
    ...record,
    performedBy: userMap.get(record[key]) || null
  }));
};

module.exports = {
  getTenantContext,
  attachUsersById
};
