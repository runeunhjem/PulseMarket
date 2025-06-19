const request = require("supertest");
const app = require("../app");
const { sequelize, Product, Brand, Category } = require("../models");

let token;
let categoryId;
let brandId;
let productId;

beforeAll(async () => {
  const initRes = await request(app).post("/init").send({ force: true });

  if (!initRes.body.success && initRes.body.message !== "System already initialized.") {
    throw new Error(`❌ /init failed: ${initRes.body.message}`);
  }

  const loginRes = await request(app).post("/auth/login").send({
    identifier: "admin@noroff.no",
    password: "P@ssword2023",
  });

  token = loginRes.body.data.token;
});

afterAll(async () => {
  try {
    if (productId) {
      const product = await Product.findByPk(productId, { paranoid: false });
      if (product) {
        await product.destroy({ force: true });
      }
    }


    if (brandId) {
      await Brand.destroy({ where: { id: brandId } });
    }

    if (categoryId) {
      await Category.destroy({ where: { id: categoryId } });
    }

    await sequelize.close();
  } catch (err) {
    console.warn("❌ Cleanup failed or Sequelize connection already closed:", err.message);
  }
});

describe("Product Flow Test", () => {
  test("1. Create TEST_CATEGORY", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TEST_CATEGORY" });

    expect(res.statusCode).toBe(201);
    categoryId = res.body.data.id;
  });

  test("2. Create TEST_BRAND", async () => {
    const res = await request(app).post("/brands").set("Authorization", `Bearer ${token}`).send({ name: "TEST_BRAND" });

    expect(res.statusCode).toBe(201);
    brandId = res.body.data.id;
  });

  test("3. Create TEST_PRODUCT", async () => {
    const res = await request(app).post("/products").set("Authorization", `Bearer ${token}`).send({
      name: "TEST_PRODUCT",
      description: "This is a test product",
      unitprice: 99.99,
      quantity: 10,
      imgurl: "https://example.com/test.jpg",
      CategoryId: categoryId,
      BrandId: brandId,
    });

    expect(res.statusCode).toBe(201);
    productId = res.body.data.id;
  });

  test("4. Get TEST_PRODUCT with brand and category names", async () => {
    const res = await request(app).get("/products").set("Authorization", `Bearer ${token}`);
    const product = res.body.data.products.find((p) => p.id === productId);

    expect(product).toBeDefined();
    expect(product.brand).toBe("TEST_BRAND");
    expect(product.category).toBe("TEST_CATEGORY");
  });

  test("5. Update TEST_CATEGORY to TEST_CATEGORY2", async () => {
    const res = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TEST_CATEGORY2" });

    expect(res.statusCode).toBe(200);
  });

  test("6. Update TEST_BRAND to TEST_BRAND2", async () => {
    const res = await request(app)
      .put(`/brands/${brandId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TEST_BRAND2" });

    expect(res.statusCode).toBe(200);
  });

  test("7. Get TEST_PRODUCT again and verify updated brand/category", async () => {
    const res = await request(app).get("/products").set("Authorization", `Bearer ${token}`);
    const product = res.body.data.products.find((p) => p.id === productId);

    expect(product).toBeDefined();
    expect(product.brand).toBe("TEST_BRAND2");
    expect(product.category).toBe("TEST_CATEGORY2");
  });

  test("8. Delete TEST_PRODUCT (soft delete)", async () => {
    const res = await request(app).delete(`/products/${productId}`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/soft-deleted/i);
  });

  test("9. Restore soft-deleted TEST_PRODUCT", async () => {
    const res = await request(app).patch(`/products/${productId}/restore`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/restored successfully/i);
  });

  test("10. Get soft-deleted products", async () => {
    await request(app).delete(`/products/${productId}`).set("Authorization", `Bearer ${token}`);
    const res = await request(app).get("/products/deleted").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });
});
