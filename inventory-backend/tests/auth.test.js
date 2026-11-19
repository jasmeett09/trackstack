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
  const promises = Object.values(collections).map((collection) =>
    collection.deleteMany({})
  );
  await Promise.all(promises);
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

describe("Authentication routes", () => {
  test("should register a user", async () => {
    const response = await request(app).post("/auth/register").type("form").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "secret123",
      confirmPassword: "secret123"
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  test("should login a registered user", async () => {
    await request(app).post("/auth/register").type("form").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "secret123",
      confirmPassword: "secret123"
    });

    const response = await request(app).post("/auth/login").type("form").send({
      email: "admin@example.com",
      password: "secret123"
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/dashboard");
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
