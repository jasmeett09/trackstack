const applyStockChange = (currentQuantity, transactionType, quantity) => {
  if (transactionType === "stock-in") {
    return currentQuantity + quantity;
  }

  if (currentQuantity - quantity < 0) {
    const error = new Error("Insufficient stock for stock-out transaction.");
    error.statusCode = 400;
    throw error;
  }

  return currentQuantity - quantity;
};

module.exports = {
  applyStockChange
};
