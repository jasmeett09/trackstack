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

describe("Item management", () => {
  test("should create an item after login", async () => {
    const Category = require("../src/models/Category");
    const Supplier = require("../src/models/Supplier");

    const category = await Category.create({ name: "Electronics" });
    const supplier = await Supplier.create({ name: "ABC Supplier" });

    const agent = request.agent(app);

    await agent.post("/auth/register").type("form").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "secret123",
      confirmPassword: "secret123"
    });

    await agent.post("/auth/login").type("form").send({
      email: "admin@example.com",
      password: "secret123"
    });

    const response = await agent.post("/items").type("form").send({
      name: "Laptop",
      category: category._id.toString(),
      quantity: 12,
      unit: "pcs",
      supplier: supplier._id.toString(),
      price: 55000,
      description: "Lab stock"
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/items");
  });

  test("should list items in JSON API", async () => {
    const Category = require("../src/models/Category");
    const Supplier = require("../src/models/Supplier");
    const Item = require("../src/models/Item");

    const category = await Category.create({ name: "Stationery" });
    const supplier = await Supplier.create({ name: "Campus Supplier" });

    await Item.create({
      name: "Notebook",
      category: category._id,
      quantity: 50,
      unit: "pcs",
      supplier: supplier._id,
      price: 40
    });

    const response = await request(app).get("/api/items");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe("Notebook");
  });
});
