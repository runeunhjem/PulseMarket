const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let token;
let productId;

beforeAll(async () => {
  // Init system
  const initRes = await request(app).post("/init").send({ force: true });
  if (!initRes.body.success && initRes.body.message !== "System already initialized.") {
    throw new Error(`❌ /init failed: ${initRes.body.message}`);
  }

  // Login as admin
  const loginRes = await request(app).post("/auth/login").send({
    identifier: "admin@noroff.no",
    password: "P@ssword2023",
  });

  if (!loginRes.body.success || !loginRes.body.data?.token) {
    console.error(loginRes.body);
    throw new Error("❌ Login failed in beforeAll.");
  }

  token = loginRes.body.data.token;

  // Get product to add to cart
  const productsRes = await request(app).get("/products").set("Authorization", `Bearer ${token}`);
  const product = productsRes.body.data.products.find((p) => !p.isDeleted);

  if (!product) throw new Error("No valid product found for cart.");
  productId = product.id;
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.warn("Sequelize connection already closed.");
  }
});

describe("Cart Flow Test", () => {
  test("1. Add product to cart", async () => {
    const res = await request(app).post("/cart").set("Authorization", `Bearer ${token}`).send({
      productId,
      quantity: 2,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("quantity", 2);
  });

  test("2. Get cart contents", async () => {
    const res = await request(app).get("/cart").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("Product");
    expect(res.body.data[0].Product).toHaveProperty("name");
  });

  test("3. Delete one item from cart", async () => {
    const res = await request(app).delete(`/cart/${productId}`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/removed from cart/i);
  });

  test("4. Add product again and then clear cart", async () => {
    await request(app).post("/cart").set("Authorization", `Bearer ${token}`).send({ productId, quantity: 1 });

    const res = await request(app).delete("/cart").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Cart cleared/i);
  });

  test("5. Add product and checkout cart", async () => {
    await request(app).post("/cart").set("Authorization", `Bearer ${token}`).send({ productId, quantity: 1 });

    const res = await request(app).post("/cart/checkout/now").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("orderNumber");
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
