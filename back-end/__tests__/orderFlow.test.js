const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let token;
let orderId;

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

  // Add a product to cart
  const productsRes = await request(app).get("/products").set("Authorization", `Bearer ${token}`);
  const firstProduct = productsRes.body.data.products.find((p) => !p.isDeleted);

  if (!firstProduct) throw new Error("No valid product to add to cart.");

  const cartRes = await request(app).post("/cart").set("Authorization", `Bearer ${token}`).send({
    productId: firstProduct.id,
    quantity: 2,
  });

  expect(cartRes.statusCode).toBe(200);

  // Checkout
  const checkoutRes = await request(app).post("/cart/checkout/now").set("Authorization", `Bearer ${token}`);
  expect(checkoutRes.statusCode).toBe(201);
  expect(checkoutRes.body.success).toBe(true);
  orderId = checkoutRes.body.data.orderId;
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.warn("Sequelize connection already closed.");
  }
});

describe("Order Flow Test", () => {
  test("1. Get my orders", async () => {
    const res = await request(app).get("/orders").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("orderNumber");
  });

  test("2. Get all orders as admin", async () => {
    const res = await request(app).get("/orders/all").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.find((o) => o.id === orderId)).toBeDefined();
  });

  test("3. Update order status to 'Completed'", async () => {
    const res = await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Completed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/updated to 'Completed'/i);
  });
});
