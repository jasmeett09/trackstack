const withMongoStyleId = (record) => {
  if (!record) {
    return null;
  }

  return {
    ...record,
    _id: record.id
  };
};

const mapCategory = (category) => withMongoStyleId(category);

const mapSupplier = (supplier) => withMongoStyleId(supplier);

const mapUser = (user) => withMongoStyleId(user);

const mapItem = (item) => {
  if (!item) {
    return null;
  }

  return {
    ...withMongoStyleId(item),
    createdDate: item.createdAt,
    imageUrl: item.imageUrl || "",
    reorderLevel: item.reorderLevel,
    category: mapCategory(item.category),
    supplier: mapSupplier(item.supplier)
  };
};

const mapTransaction = (transaction) => {
  if (!transaction) {
    return null;
  }

  return {
    ...withMongoStyleId(transaction),
    date: transaction.createdAt,
    item: mapItem(transaction.item),
    performedBy: mapUser(transaction.performedBy)
  };
};

const mapPurchase = (purchase) => {
  if (!purchase) {
    return null;
  }

  return {
    ...withMongoStyleId(purchase),
    date: purchase.purchaseDate,
    item: mapItem(purchase.item),
    supplier: mapSupplier(purchase.supplier)
  };
};

const mapSale = (sale) => {
  if (!sale) {
    return null;
  }

  return {
    ...withMongoStyleId(sale),
    date: sale.saleDate,
    item: mapItem(sale.item)
  };
};

const mapActivityLog = (log) => {
  if (!log) {
    return null;
  }

  return {
    id: log._id?.toString?.() || log.id || "",
    action: log.action,
    entity: log.entity,
    details: log.details || {},
    timestamp: log.timestamp || log.createdAt
  };
};

const mapInventoryLog = (log) => {
  if (!log) {
    return null;
  }

  return {
    id: log._id?.toString?.() || log.id || "",
    itemId: log.itemId || "",
    userId: log.userId || "",
    action: log.action,
    oldQuantity: log.oldQuantity,
    newQuantity: log.newQuantity,
    metadata: log.metadata || {},
    timestamp: log.timestamp || log.createdAt
  };
};

const mapNotification = (notification, currentUserId = "") => {
  if (!notification) {
    return null;
  }

  const id = notification._id?.toString?.() || notification.id || "";
  const readBy = notification.readBy || [];
  const normalizedUserId = currentUserId?.toString?.() || "";

  return {
    id,
    _id: id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entity: notification.entity || "",
    entityId: notification.entityId || "",
    metadata: notification.metadata || {},
    createdAt: notification.createdAt || notification.timestamp,
    isRead: normalizedUserId ? readBy.includes(normalizedUserId) : false
  };
};

module.exports = {
  mapCategory,
  mapSupplier,
  mapItem,
  mapTransaction,
  mapPurchase,
  mapSale,
  mapActivityLog,
  mapInventoryLog,
  mapNotification,
  mapUser
};
