const { prisma } = require("../config/prisma");
const auditLogService = require("./auditLogService");
const notificationService = require("./notificationService");
const { mapSale } = require("../utils/prismaSerializers");
const { attachUsersById, getTenantContext } = require("./tenantService");
const { LOW_STOCK_THRESHOLD } = require("../constants/inventory");

const createSale = async ({ itemId, customerName, quantity, sellingPrice, note, userId }) => {
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

    if (item.quantity < quantity) {
      const error = new Error("Insufficient stock for this sale.");
      error.statusCode = 400;
      throw error;
    }

    const updatedItem = await tx.item.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity - quantity
      },
      include: {
        category: true,
        supplier: true
      }
    });

    const sale = await tx.sale.create({
      data: {
        itemId: item.id,
        userId: tenant.userId,
        organizationId: tenant.organizationId,
        customerName: customerName || null,
        quantity,
        sellingPrice,
        note: note || null
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

    await tx.transaction.create({
      data: {
        itemId: item.id,
        transactionType: "stock-out",
        quantity,
        note: note || "Sale recorded",
        organizationId: tenant.organizationId,
        performedById: tenant.userId
      }
    });

    return { item, updatedItem, sale };
  });

  await auditLogService.logActivity({
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    action: "sale.created",
    entity: "Sale",
    details: {
      saleId: result.sale.id,
      itemId,
      quantity,
      sellingPrice,
      customerName: customerName || ""
    }
  });
  await auditLogService.logInventoryChange({
    organizationId: tenant.organizationId,
    itemId,
    userId: tenant.userId,
    action: "sale.stock_out",
    oldQuantity: result.item.quantity,
    newQuantity: result.updatedItem.quantity,
    metadata: {
      saleId: result.sale.id,
      sellingPrice,
      customerName: customerName || ""
    }
  });
  await notificationService.createNotification({
    organizationId: tenant.organizationId,
    actorUserId: tenant.userId,
    type: "inventory.sale.recorded",
    title: "Sale recorded",
    message: `${result.sale.quantity} ${result.updatedItem.unit} of ${result.updatedItem.name} sold.`,
    entity: "Sale",
    entityId: result.sale.id,
    metadata: {
      itemId: result.updatedItem.id,
      itemName: result.updatedItem.name,
      newQuantity: result.updatedItem.quantity
    }
  });

  if (result.updatedItem.quantity < LOW_STOCK_THRESHOLD) {
    await notificationService.createNotification({
      organizationId: tenant.organizationId,
      actorUserId: tenant.userId,
      type: "inventory.low_stock",
      title: "Low stock alert",
      message: `${result.updatedItem.name} dropped below the low-stock threshold of ${LOW_STOCK_THRESHOLD}.`,
      entity: "Item",
      entityId: result.updatedItem.id,
      metadata: {
        itemName: result.updatedItem.name,
        quantity: result.updatedItem.quantity,
        reorderLevel: LOW_STOCK_THRESHOLD,
        unit: result.updatedItem.unit
      }
    });
  }

  const [saleWithUser] = await attachUsersById([result.sale]);
  return mapSale(saleWithUser);
};

const getAllSales = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const sales = await prisma.sale.findMany({
    where: { organizationId },
    include: {
      item: {
        include: {
          category: true,
          supplier: true
        }
      }
    },
    orderBy: { saleDate: "desc" }
  });

  return (await attachUsersById(sales)).map(mapSale);
};

const countSales = async (userId) =>
  prisma.sale.count({
    where: { organizationId: (await getTenantContext(userId)).organizationId }
  });

module.exports = {
  createSale,
  getAllSales,
  countSales
};
