const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let token;

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

describe("Membership Flow Test", () => {
  test("1. Get all memberships", async () => {
    const res = await request(app).get("/memberships").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3); // Bronze, Silver, Gold
  });

  test("2. Check that Bronze membership exists", async () => {
    const res = await request(app).get("/memberships").set("Authorization", `Bearer ${token}`);
    const bronze = res.body.data.find((m) => m.name === "Bronze");

    expect(bronze).toBeDefined();
    expect(bronze.discount).toBe(0);
  });

  test("3. Check that Gold has correct discount", async () => {
    const res = await request(app).get("/memberships").set("Authorization", `Bearer ${token}`);
    const gold = res.body.data.find((m) => m.name === "Gold");

    expect(gold).toBeDefined();
    expect(gold.discount).toBe(30);
  });
});
