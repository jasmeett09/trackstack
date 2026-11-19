import { LOW_STOCK_THRESHOLD } from '../constants/inventory';

export const mapItem = (item) => ({
  id: item._id,
  itemId: item._id,
  itemName: item.name,
  categoryId: item.category?._id || '',
  categoryName: item.category?.name || 'N/A',
  quantity: item.quantity,
  reorderLevel: item.reorderLevel ?? LOW_STOCK_THRESHOLD,
  price: item.price,
  unit: item.unit,
  supplierId: item.supplier?._id || '',
  supplierName: item.supplier?.name || 'N/A',
  description: item.description || '',
  imageUrl: item.imageUrl || '',
  imageFile: null
});

export const mapCategory = (category) => ({
  id: category._id,
  categoryId: category._id,
  categoryName: category.name,
  description: category.description || ''
});

export const mapSupplier = (supplier) => ({
  id: supplier._id,
  supplierId: supplier._id,
  supplierName: supplier.name,
  contactPerson: supplier.contactPerson || '',
  phone: supplier.phone || '',
  address: supplier.address || ''
});

export const mapTransaction = (transaction) => ({
  id: transaction._id,
  transactionId: transaction._id,
  transactionType: transaction.transactionType,
  transactionDate: transaction.date,
  quantity: transaction.quantity,
  note: transaction.note || '',
  itemId: transaction.item?._id || '',
  itemName: transaction.item?.name || 'N/A',
  supplierName: transaction.item?.supplier?.name || 'N/A',
  performedBy: transaction.performedBy?.name || 'Unknown'
});

export const mapPurchase = (purchase) => ({
  id: purchase._id,
  purchaseId: purchase._id,
  purchaseDate: purchase.date,
  quantity: purchase.quantity,
  note: purchase.note || '',
  purchasePrice: purchase.purchasePrice || 0,
  itemId: purchase.item?._id || '',
  itemName: purchase.item?.name || 'N/A',
  supplierId: purchase.supplier?._id || '',
  supplierName: purchase.supplier?.name || 'N/A',
  performedBy: purchase.performedBy?.name || 'Unknown'
});

export const mapSale = (sale) => ({
  id: sale._id,
  saleId: sale._id,
  saleDate: sale.date,
  quantity: sale.quantity,
  note: sale.note || '',
  sellingPrice: sale.sellingPrice || 0,
  customerName: sale.customerName || '',
  itemId: sale.item?._id || '',
  itemName: sale.item?.name || 'N/A',
  performedBy: sale.performedBy?.name || 'Unknown'
});

export const mapAnalytics = (analytics) => ({
  stats: analytics.stats,
  lowStockItems: analytics.lowStockItems || [],
  topSellingProducts: analytics.topSellingProducts || [],
  monthlySales: analytics.monthlySales || [],
  recentActivity: analytics.recentActivity || []
});

export const mapActivityLog = (log) => ({
  id: log.id,
  action: log.action,
  entity: log.entity,
  details: log.details || {},
  timestamp: log.timestamp
});

export const mapInventoryLog = (log) => ({
  id: log.id,
  itemId: log.itemId,
  userId: log.userId,
  action: log.action,
  oldQuantity: log.oldQuantity,
  newQuantity: log.newQuantity,
  metadata: log.metadata || {},
  timestamp: log.timestamp
});
