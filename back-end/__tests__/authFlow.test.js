const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

beforeAll(async () => {
  const initRes = await request(app).post("/init").send({ force: true });

  if (!initRes.body.success && initRes.body.message !== "System already initialized.") {
    throw new Error(`❌ /init failed: ${initRes.body.message}`);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.warn("Sequelize connection already closed.");
  }
});

describe("Auth Flow Test", () => {
  let token;

  // --- LOGIN ---
  test("1. Login with valid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: "admin@noroff.no",
      password: "P@ssword2023",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");

    token = res.body.data.token;
  });

  test("2. Login with invalid password", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: "admin@noroff.no",
      password: "wrongPassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test("3. Login with non-existing user", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: "nobody@example.com",
      password: "testing123!",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  // --- REGISTER ---
  test("4. Successful registration", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "test123!",
      address: "example street 123",
      phone: "12345678",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user).toHaveProperty("id");
    expect(res.body.data.user.username).toBe("johndoe");
  });

  test("5. Registration with existing email", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "Test",
      lastname: "User",
      username: "anotherUser",
      email: "johndoe@example.com",
      password: "test123!",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email already/i);
  });

  test("6. Registration with existing username", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "Test",
      lastname: "User",
      username: "johndoe",
      email: "unique@example.com",
      password: "test123!",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/username already/i);
  });

  test("7. Registration with missing required fields", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "missingFields",
      password: "test123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/missing required/i);
  });

  test("8. Registration with invalid email format", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "Invalid",
      lastname: "Email",
      username: "testbademail",
      email: "invalid-email",
      password: "test123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  test("9. Registration with invalid username format", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "Invalid",
      lastname: "Username",
      username: "bad@user!",
      email: "baduser@example.com",
      password: "Test123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/username can only contain/i);
  });

  test("10. Registration with invalid phone number", async () => {
    const res = await request(app).post("/auth/register").send({
      firstname: "Phone",
      lastname: "Invalid",
      username: "phoneinvalid",
      email: "phone@example.com",
      password: "Test123!",
      phone: "abc12345",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/phone number must/i);
  });
});
