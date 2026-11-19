const { prisma } = require("../config/prisma");
const { mapCategory } = require("../utils/prismaSerializers");
const auditLogService = require("./auditLogService");
const { getTenantContext } = require("./tenantService");

const findDuplicateCategory = async (organizationId, name) =>
  prisma.category.findFirst({
    where: {
      organizationId,
      name: {
        equals: name.trim(),
        mode: "insensitive"
      }
    }
  });

const getAllCategories = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const categories = await prisma.category.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  });

  return categories.map(mapCategory);
};

const getCategoryOptions = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const categories = await prisma.category.findMany({
    where: { organizationId },
    orderBy: { name: "asc" }
  });

  return categories.map(mapCategory);
};

const getCategoryById = async (id, userId) => {
  const { organizationId } = await getTenantContext(userId);
  const category = await prisma.category.findFirst({
    where: {
      id,
      organizationId
    }
  });

  return mapCategory(category);
};

const createCategory = async (userId, data) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const name = data.name.trim();
  const existingCategory = await findDuplicateCategory(organizationId, name);

  if (existingCategory) {
    const error = new Error("Category already exists for this user.");
    error.statusCode = 409;
    throw error;
  }

  const category = await prisma.category.create({
    data: {
      organizationId,
      name,
      description: data.description || null
    }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "category.created",
    entity: "Category",
    details: {
      categoryId: category.id,
      name: category.name
    }
  });

  return mapCategory(category);
};

const updateCategory = async (id, userId, data) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const category = await prisma.category.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!category) {
    return null;
  }

  const duplicateCategory = await prisma.category.findFirst({
    where: {
      organizationId,
      id: { not: id },
      name: {
        equals: data.name.trim(),
        mode: "insensitive"
      }
    }
  });

  if (duplicateCategory) {
    const error = new Error("Category already exists for this user.");
    error.statusCode = 409;
    throw error;
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: data.name.trim(),
      description: data.description || null
    }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "category.updated",
    entity: "Category",
    details: {
      categoryId: updatedCategory.id,
      previous: {
        name: category.name,
        description: category.description
      },
      current: {
        name: updatedCategory.name,
        description: updatedCategory.description
      }
    }
  });

  return mapCategory(updatedCategory);
};

const deleteCategory = async (id, userId) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const category = await prisma.category.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!category) {
    return null;
  }

  const deletedCategory = await prisma.category.delete({
    where: { id }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "category.deleted",
    entity: "Category",
    details: {
      categoryId: deletedCategory.id,
      name: deletedCategory.name
    }
  });

  return mapCategory(deletedCategory);
};

const countCategories = async (userId) =>
  prisma.category.count({
    where: {
      organizationId: (await getTenantContext(userId)).organizationId
    }
  });

module.exports = {
  getAllCategories,
  getCategoryOptions,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  countCategories
};
