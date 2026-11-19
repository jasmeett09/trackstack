const http = require("http");
const connectDB = require("./src/config/db");
const keys = require("./src/config/keys");
const { initSocket } = require("./src/config/socket");

const startServer = async () => {
  if (keys.isProduction) {
    const requiredKeys = ["DATABASE_URL", "MONGO_URI", "SESSION_SECRET", "JWT_SECRET"];
    const missingKeys = requiredKeys.filter((key) => !process.env[key]?.trim());
    if (missingKeys.length) {
      throw new Error(`Missing production environment variables: ${missingKeys.join(", ")}`);
    }
  }

  const { connectPrisma } = require("./src/config/prisma");
  await connectDB();
  await connectPrisma();

  const app = require("./src/app");
  const server = http.createServer(app);
  const io = initSocket(server, app.locals.sessionMiddleware);
  app.locals.io = io;

  server.listen(keys.port, () => {
    console.log(`Server running on http://localhost:${keys.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
