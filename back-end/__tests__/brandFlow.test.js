const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let token;
let brandId;

beforeAll(async () => {
  const initRes = await request(app).post("/init").send({ force: true });

  if (!initRes.body.success && initRes.body.message !== "System already initialized.") {
    throw new Error(`❌ /init failed: ${initRes.body.message}`);
  }

  const loginRes = await request(app).post("/auth/login").send({
    identifier: "admin@noroff.no",
    password: "P@ssword2023",
  });

  if (!loginRes.body.success || !loginRes.body.data?.token) {
    console.error(loginRes.body);
    throw new Error("❌ Login failed in beforeAll. Cannot run tests.");
  }

  token = loginRes.body.data.token;
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.warn("Sequelize connection already closed.");
  }
});

describe("Brand Flow Test", () => {
  test("1. Create TEST_BRAND", async () => {
    const res = await request(app).post("/brands").set("Authorization", `Bearer ${token}`).send({ name: "TEST_BRAND" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("TEST_BRAND");
    brandId = res.body.data.id;
  });

  test("2. Get all brands", async () => {
    const res = await request(app).get("/brands").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((b) => b.id === brandId)).toBe(true);
  });

  test("3. Update TEST_BRAND to TEST_BRAND_UPDATED", async () => {
    const res = await request(app)
      .put(`/brands/${brandId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TEST_BRAND_UPDATED" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("TEST_BRAND_UPDATED");
  });

  test("4. Delete TEST_BRAND", async () => {
    const res = await request(app).delete(`/brands/${brandId}`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
