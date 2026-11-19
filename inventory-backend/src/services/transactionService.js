const { prisma } = require("../config/prisma");
const { applyStockChange } = require("../utils/stockHelpers");
const { mapItem, mapTransaction } = require("../utils/prismaSerializers");
const auditLogService = require("./auditLogService");
const notificationService = require("./notificationService");
const { attachUsersById, getTenantContext } = require("./tenantService");
const { LOW_STOCK_THRESHOLD } = require("../constants/inventory");

const createTransactionAndUpdateStock = async ({
  itemId,
  transactionType,
  quantity,
  note,
  userId
}) => {
  const tenant = await getTenantContext(userId);
  const result = await prisma.$transaction(async (tx) => {
    const existingItem = await tx.item.findFirst({
      where: {
        id: itemId,
        organizationId: tenant.organizationId
      }
    });

    if (!existingItem) {
      const error = new Error("Item not found.");
      error.statusCode = 404;
      throw error;
    }

    const updatedQuantity = applyStockChange(existingItem.quantity, transactionType, quantity);

    const updatedItem = await tx.item.update({
      where: { id: existingItem.id },
      data: {
        quantity: updatedQuantity
      },
      include: {
        category: true,
        supplier: true
      }
    });

    const transaction = await tx.transaction.create({
      data: {
        itemId: existingItem.id,
        transactionType,
        quantity,
        note: note || null,
        organizationId: tenant.organizationId,
        performedById: tenant.userId
      },
      include: {
        item: {
          include: {
            category: true,
            supplier: true
          }
        }
      }
    });

    return {
      item: updatedItem,
      transaction
    };
  });

  const [transactionWithUser] = await attachUsersById([result.transaction], "performedById");
  await auditLogService.logActivity({
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    action: "transaction.recorded",
    entity: "Transaction",
    details: {
      transactionId: result.transaction.id,
      itemId: result.item.id,
      transactionType,
      quantity
    }
  });
  await auditLogService.logInventoryChange({
    organizationId: tenant.organizationId,
    itemId,
    userId: tenant.userId,
    action: transactionType,
    oldQuantity:
      transactionType === "stock-in"
        ? result.item.quantity - quantity
        : result.item.quantity + quantity,
    newQuantity: result.item.quantity,
    metadata: {
      source: "transaction.create",
      note: note || ""
    }
  });
  await notificationService.createNotification({
    organizationId: tenant.organizationId,
    actorUserId: tenant.userId,
    type: "inventory.transaction.recorded",
    title: "Stock transaction recorded",
    message: `${quantity} ${result.item.unit} ${transactionType === "stock-in" ? "added to" : "removed from"} ${result.item.name}.`,
    entity: "Transaction",
    entityId: result.transaction.id,
    metadata: {
      itemId: result.item.id,
      itemName: result.item.name,
      quantity: result.item.quantity,
      transactionType
    }
  });

  if (result.item.quantity < LOW_STOCK_THRESHOLD) {
    await notificationService.createNotification({
      organizationId: tenant.organizationId,
      actorUserId: tenant.userId,
      type: "inventory.low_stock",
      title: "Low stock alert",
      message: `${result.item.name} is now below the low-stock threshold of ${LOW_STOCK_THRESHOLD}.`,
      entity: "Item",
      entityId: result.item.id,
      metadata: {
        itemName: result.item.name,
        quantity: result.item.quantity,
        reorderLevel: LOW_STOCK_THRESHOLD,
        unit: result.item.unit
      }
    });
  }

  return {
    item: mapItem(result.item),
    transaction: mapTransaction(transactionWithUser)
  };
};

const getAllTransactions = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const transactions = await prisma.transaction.findMany({
    where: { organizationId },
    include: {
      item: {
        include: {
          category: true,
          supplier: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (await attachUsersById(transactions, "performedById")).map(mapTransaction);
};

const getRecentTransactions = async (userId, limit = 5) => {
  const { organizationId } = await getTenantContext(userId);
  const transactions = await prisma.transaction.findMany({
    where: { organizationId },
    include: {
      item: {
        include: {
          category: true,
          supplier: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return (await attachUsersById(transactions, "performedById")).map(mapTransaction);
};

module.exports = {
  createTransactionAndUpdateStock,
  getAllTransactions,
  getRecentTransactions
};
