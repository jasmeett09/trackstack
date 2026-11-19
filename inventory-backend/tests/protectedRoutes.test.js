const path = require("path");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongoServer;
jest.setTimeout(30000);

beforeAll(async () => {
  process.env.MONGOMS_DOWNLOAD_DIR = path.join(process.cwd(), ".mongodb-binaries");
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.SESSION_SECRET = "test_session_secret";
  process.env.JWT_SECRET = "test_jwt_secret";
  app = require("../src/app");
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Protected routes", () => {
  test("should redirect unauthenticated user from dashboard", async () => {
    const response = await request(app).get("/dashboard");

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  test("should reject JWT protected profile route without token", async () => {
    const response = await request(app).get("/api/profile");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("JWT token is required.");
  });
});
