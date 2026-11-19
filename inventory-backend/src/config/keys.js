const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const normalizeOrigin = (value) => (value ? value.replace(/\/$/, "") : "");
const splitOrigins = (value = "") =>
  value
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL || "http://localhost:5173");
const allowedOrigins = [
  ...new Set([frontendUrl, ...splitOrigins(process.env.ALLOWED_ORIGINS)])
];

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri:
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/inventory_management_system",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/inventory_management_system?schema=public",
  sessionSecret: process.env.SESSION_SECRET || "inventory_session_secret",
  jwtSecret: process.env.JWT_SECRET || "inventory_jwt_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  frontendUrl,
  allowedOrigins,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || ""
};
