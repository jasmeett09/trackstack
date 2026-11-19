const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    actorUserId: {
      type: String,
      default: null,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    entity: {
      type: String,
      default: "",
      trim: true
    },
    entityId: {
      type: String,
      default: "",
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    readBy: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false }
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
