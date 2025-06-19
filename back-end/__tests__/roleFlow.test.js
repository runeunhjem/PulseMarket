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

describe("Role Flow Test", () => {
  test("1. Get all roles", async () => {
    const res = await request(app).get("/roles").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4); // Admin, User, Support, Staff
  });

  test("2. Check that Admin role has isAdmin=true", async () => {
    const res = await request(app).get("/roles").set("Authorization", `Bearer ${token}`);
    const adminRole = res.body.data.find((r) => r.name === "Admin");

    expect(adminRole).toBeDefined();
    expect(adminRole.isAdmin).toBe(true);
  });

  test("3. Check that Staff role has isAdmin=false", async () => {
    const res = await request(app).get("/roles").set("Authorization", `Bearer ${token}`);
    const staffRole = res.body.data.find((r) => r.name === "Staff");

    expect(staffRole).toBeDefined();
    expect(staffRole.isAdmin).toBe(false);
  });

  test("4. Check that Support role has default Gold membership", async () => {
    const res = await request(app).get("/roles").set("Authorization", `Bearer ${token}`);
    const supportRole = res.body.data.find((r) => r.name === "Support");

    expect(supportRole).toBeDefined();
    expect(supportRole.defaultMembershipId).toBe(3); // Gold
  });
});
