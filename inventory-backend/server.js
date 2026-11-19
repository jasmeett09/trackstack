const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { connectPrisma } = require("./src/config/prisma");
const keys = require("./src/config/keys");
const { initSocket } = require("./src/config/socket");

const startServer = async () => {
  await connectDB();
  await connectPrisma();

  const server = http.createServer(app);
  const io = initSocket(server);
  app.locals.io = io;

  server.listen(keys.port, () => {
    console.log(`Server running on http://localhost:${keys.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
