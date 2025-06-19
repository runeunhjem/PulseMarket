const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let token;
let categoryId;

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

describe("Category Flow Test", () => {
  test("1. Create TEST_CATEGORY", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TEST_CATEGORY" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("TEST_CATEGORY");
    categoryId = res.body.data.id;
  });

  test("2. Get all categories", async () => {
    const res = await request(app).get("/categories").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((cat) => cat.id === categoryId)).toBe(true);
  });

  test("3. Update TEST_CATEGORY to TEST_CATEGORY_UPDATED", async () => {
    const res = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TEST_CATEGORY_UPDATED" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("TEST_CATEGORY_UPDATED");
  });

  test("4. Delete TEST_CATEGORY", async () => {
    const res = await request(app).delete(`/categories/${categoryId}`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
