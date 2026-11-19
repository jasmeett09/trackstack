const { prisma } = require("../config/prisma");
const { mapItem } = require("../utils/prismaSerializers");
const auditLogService = require("./auditLogService");
const { getTenantContext } = require("./tenantService");

const ensureOwnedReferences = async ({ categoryId, supplierId, userId }) => {
  const { organizationId } = await getTenantContext(userId);
  const [category, supplier] = await Promise.all([
    prisma.category.findFirst({ where: { id: categoryId, organizationId } }),
    prisma.supplier.findFirst({ where: { id: supplierId, organizationId } })
  ]);

  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!supplier) {
    const error = new Error("Supplier not found.");
    error.statusCode = 404;
    throw error;
  }
};

const createItem = async (data) => {
  const { organizationId, userId } = await getTenantContext(data.user);
  await ensureOwnedReferences({
    categoryId: data.category,
    supplierId: data.supplier,
    userId: data.user
  });

  const item = await prisma.item.create({
    data: {
      organizationId,
      createdBy: userId,
      name: data.name.trim(),
      categoryId: data.category,
      quantity: data.quantity,
      reorderLevel: data.reorderLevel,
      unit: data.unit.trim(),
      supplierId: data.supplier,
      price: data.price,
      description: data.description || null,
      imageUrl: data.imageUrl || null
    },
    include: {
      category: true,
      supplier: true
    }
  });

  await auditLogService.logActivity({
    organizationId,
    userId,
    action: "item.created",
    entity: "Item",
    details: {
      itemId: item.id,
      name: item.name,
      quantity: item.quantity
    }
  });
  await auditLogService.logInventoryChange({
    organizationId,
    itemId: item.id,
    userId,
    action: "item.created",
    oldQuantity: 0,
    newQuantity: item.quantity,
    metadata: {
      source: "item.create"
    }
  });

  return mapItem(item);
};

const getAllItems = async (userId) =>
  (
    await prisma.item.findMany({
      where: { organizationId: (await getTenantContext(userId)).organizationId },
      include: {
        category: true,
        supplier: true
      },
      orderBy: { createdAt: "desc" }
    })
  ).map(mapItem);

const getItemById = async (id, userId) =>
  mapItem(
    await prisma.item.findFirst({
      where: {
        id,
        organizationId: (await getTenantContext(userId)).organizationId
      },
      include: {
        category: true,
        supplier: true
      }
    })
  );

const updateItem = async (id, userId, data) =>
  (async () => {
    await ensureOwnedReferences({
      categoryId: data.category,
      supplierId: data.supplier,
      userId
    });

    const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
    const existingItem = await prisma.item.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingItem) {
      return null;
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name: data.name.trim(),
        categoryId: data.category,
        quantity: data.quantity,
        reorderLevel: data.reorderLevel,
        unit: data.unit.trim(),
        supplierId: data.supplier,
        price: data.price,
        description: data.description || null,
        ...(Object.prototype.hasOwnProperty.call(data, "imageUrl")
          ? { imageUrl: data.imageUrl || null }
          : {})
      },
      include: {
        category: true,
        supplier: true
      }
    });

    await auditLogService.logActivity({
      organizationId,
      userId: resolvedUserId,
      action: "item.updated",
      entity: "Item",
      details: {
        itemId: updatedItem.id,
        previous: {
          name: existingItem.name,
          quantity: existingItem.quantity,
          reorderLevel: existingItem.reorderLevel,
          unit: existingItem.unit,
          price: existingItem.price
        },
        current: {
          name: updatedItem.name,
          quantity: updatedItem.quantity,
          reorderLevel: updatedItem.reorderLevel,
          unit: updatedItem.unit,
          price: updatedItem.price
        }
      }
    });
    if (existingItem.quantity !== updatedItem.quantity) {
      await auditLogService.logInventoryChange({
        organizationId,
        itemId: updatedItem.id,
        userId: resolvedUserId,
        action: "item.quantity_updated",
        oldQuantity: existingItem.quantity,
        newQuantity: updatedItem.quantity,
        metadata: {
          source: "item.update"
        }
      });
    }

    return mapItem(updatedItem);
  })();

const deleteItem = async (id, userId) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const item = await prisma.item.findFirst({
    where: {
      id,
      organizationId
    },
    include: {
      category: true,
      supplier: true
    }
  });

  if (!item) {
    return null;
  }

  await prisma.item.delete({
    where: { id }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "item.deleted",
    entity: "Item",
    details: {
      itemId: item.id,
      name: item.name,
      quantity: item.quantity
    }
  });
  await auditLogService.logInventoryChange({
    organizationId,
    itemId: item.id,
    userId: resolvedUserId,
    action: "item.deleted",
    oldQuantity: item.quantity,
    newQuantity: 0,
    metadata: {
      source: "item.delete"
    }
  });

  return mapItem(item);
};

const getItemOptions = async (userId) =>
  (
    await prisma.item.findMany({
      where: { organizationId: (await getTenantContext(userId)).organizationId },
      orderBy: { name: "asc" }
    })
  ).map(mapItem);

const countItems = async (userId) =>
  prisma.item.count({
    where: { organizationId: (await getTenantContext(userId)).organizationId }
  });

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemOptions,
  countItems
};
