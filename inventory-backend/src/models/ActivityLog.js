const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entity: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false }
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
