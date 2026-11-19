const { PrismaClient } = require("@prisma/client");
const keys = require("./keys");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = keys.databaseUrl;
}

const globalForPrisma = global;

const prisma =
  globalForPrisma.__inventoryPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__inventoryPrisma = prisma;
}

const connectPrisma = async () => {
  await prisma.$connect();
  console.log("PostgreSQL connected");
  return prisma;
};

module.exports = {
  prisma,
  connectPrisma
};
