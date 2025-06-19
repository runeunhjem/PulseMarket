const request = require("supertest");
const app = require("../app");
const { sequelize, Product, Brand, Category } = require("../models");

beforeAll(async () => {
  const initRes = await request(app).post("/init").send({ force: true });
  if (!initRes.body.success && initRes.body.message !== "System already initialized.") {
    throw new Error(`❌ /init failed: ${initRes.body.message}`);
  }

  // Create test brand and category
  const brand = await Brand.create({ name: "TEST_BRAND" });
  const category = await Category.create({ name: "TEST_CATEGORY" });

  await Product.create({
    name: "TEST_PRODUCT",
    description: "A searchable test product",
    unitprice: 100,
    quantity: 5,
    imgurl: "https://example.com/test.jpg",
    BrandId: brand.id,
    CategoryId: category.id,
  });
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.warn("Sequelize connection already closed.");
  }
});

describe("Search Flow Test", () => {
  test("1. Search by known product name", async () => {
    const res = await request(app).post("/search").send({ name: "TEST_PRODUCT" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.results)).toBe(true);
  });

  test("2. Search by known brand name", async () => {
    const res = await request(app).post("/search").send({ brand: "TEST_BRAND" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });

  test("3. Search by known category name", async () => {
    const res = await request(app).post("/search").send({ category: "TEST_CATEGORY" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });

  test("4. Search with combined filters (name and brand)", async () => {
    const res = await request(app).post("/search").send({
      name: "TEST",
      brand: "TEST_BRAND",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.results)).toBe(true);
  });

  test("5. Empty search object returns all products", async () => {
    const res = await request(app).post("/search").send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThan(0);
  });

  test("6. Search returns zero results for unknown name", async () => {
    const res = await request(app).post("/search").send({ name: "nonexistent_product_999" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(0);
  });
});
