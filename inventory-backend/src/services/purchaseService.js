const { prisma } = require("../config/prisma");
const auditLogService = require("./auditLogService");
const notificationService = require("./notificationService");
const { mapPurchase } = require("../utils/prismaSerializers");
const { attachUsersById, getTenantContext } = require("./tenantService");

const createPurchase = async ({ itemId, supplierId, quantity, purchasePrice, note, userId }) => {
  const tenant = await getTenantContext(userId);
  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({
      where: { id: itemId, organizationId: tenant.organizationId },
      include: { category: true, supplier: true }
    });

    if (!item) {
      const error = new Error("Item not found.");
      error.statusCode = 404;
      throw error;
    }

    const supplier = await tx.supplier.findFirst({
      where: { id: supplierId, organizationId: tenant.organizationId }
    });

    if (!supplier) {
      const error = new Error("Supplier not found.");
      error.statusCode = 404;
      throw error;
    }

    const updatedItem = await tx.item.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity + quantity,
        supplierId
      },
      include: {
        category: true,
        supplier: true
      }
    });

    const purchase = await tx.purchase.create({
      data: {
        itemId: item.id,
        supplierId,
        userId: tenant.userId,
        organizationId: tenant.organizationId,
        quantity,
        purchasePrice,
        note: note || null
      },
      include: {
        item: {
          include: {
            category: true,
            supplier: true
          }
        },
        supplier: true
      }
    });

    await tx.transaction.create({
      data: {
        itemId: item.id,
        transactionType: "stock-in",
        quantity,
        note: note || "Purchase recorded",
        organizationId: tenant.organizationId,
        performedById: tenant.userId
      }
    });

    return { item, updatedItem, purchase };
  });

  await auditLogService.logActivity({
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    action: "purchase.created",
    entity: "Purchase",
    details: {
      purchaseId: result.purchase.id,
      itemId,
      supplierId,
      quantity,
      purchasePrice
    }
  });
  await auditLogService.logInventoryChange({
    organizationId: tenant.organizationId,
    itemId,
    userId: tenant.userId,
    action: "purchase.stock_in",
    oldQuantity: result.item.quantity,
    newQuantity: result.updatedItem.quantity,
    metadata: {
      purchaseId: result.purchase.id,
      purchasePrice
    }
  });
  await notificationService.createNotification({
    organizationId: tenant.organizationId,
    actorUserId: tenant.userId,
    type: "inventory.purchase.recorded",
    title: "Purchase recorded",
    message: `${result.purchase.quantity} ${result.updatedItem.unit} of ${result.updatedItem.name} added to stock.`,
    entity: "Purchase",
    entityId: result.purchase.id,
    metadata: {
      itemId: result.updatedItem.id,
      itemName: result.updatedItem.name,
      newQuantity: result.updatedItem.quantity
    }
  });

  const [purchaseWithUser] = await attachUsersById([result.purchase]);
  return mapPurchase(purchaseWithUser);
};

const getAllPurchases = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const purchases = await prisma.purchase.findMany({
    where: { organizationId },
    include: {
      item: {
        include: {
          category: true,
          supplier: true
        }
      },
      supplier: true
    },
    orderBy: { purchaseDate: "desc" }
  });

  return (await attachUsersById(purchases)).map(mapPurchase);
};

const countPurchases = async (userId) =>
  prisma.purchase.count({
    where: { organizationId: (await getTenantContext(userId)).organizationId }
  });

module.exports = {
  createPurchase,
  getAllPurchases,
  countPurchases
};
