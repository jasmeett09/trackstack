const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      trim: true
    },
    itemId: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    oldQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false }
  }
);

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);
