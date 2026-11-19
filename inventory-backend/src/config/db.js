const mongoose = require("mongoose");
const keys = require("./keys");

let isConnected = false;

const runStartupMigrations = async () => {
  const categoriesCollection = mongoose.connection.db.collection("categories");
  const indexes = await categoriesCollection.indexes().catch(() => []);
  const hasLegacyNameIndex = indexes.some((index) => index.name === "name_1");

  if (hasLegacyNameIndex) {
    await categoriesCollection.dropIndex("name_1").catch(() => {});
    console.log("Dropped legacy categories index: name_1");
  }

  // Clean up the accidental category value created while debugging the index issue.
  await categoriesCollection.deleteMany({ name: "name_1" }).catch(() => {});
};

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(keys.mongoUri);
  await runStartupMigrations();
  isConnected = true;
  console.log("MongoDB connected");
  return mongoose.connection;
};

module.exports = connectDB;
