const axios = require("axios");
const bcrypt = require("bcrypt");
const { sequelize, Role, Membership, User, Brand, Category, Product } = require("../models");

async function syncDatabase(force = false) {
  await sequelize.sync({ force });
}

async function checkIfAdminExists() {
  return await User.findOne({ where: { username: "Admin" } });
}

async function seedMemberships() {
  // NOTE:
  // Additional memberships like "Platina" (50% discount, 51–100 qty)
  // and "VIP" (75% discount, 101+ qty) are supported but not seeded here intentionally.
  // These can be added via the admin panel or manually if needed.

  return await Membership.bulkCreate([
    { id: 1, name: "Bronze", minQty: 0, maxQty: 15, discount: 0 },
    { id: 2, name: "Silver", minQty: 16, maxQty: 30, discount: 15 },
    { id: 3, name: "Gold", minQty: 31, maxQty: null, discount: 30 },
    // { id: 4, name: "Platina", minQty: 51, maxQty: 100, discount: 50 }, // Not seeded
    // { id: 5, name: "VIP", minQty: 101, maxQty: null, discount: 75 }, // Not seeded
  ]);
}

async function seedRoles() {
  // NOTE:
  // Roles like "VIP" (e.g., exclusive buyers or partners) may be added manually later.
  // These are not part of default seed data for simplicity.

  return await Role.bulkCreate([
    { id: 1, name: "Admin", isAdmin: true, defaultMembershipId: 1 }, // Bronze
    { id: 2, name: "User", isAdmin: false, defaultMembershipId: 1 }, // Bronze
    { id: 3, name: "Support", isAdmin: true, defaultMembershipId: 3 }, // Gold
    { id: 4, name: "Staff", isAdmin: false, defaultMembershipId: 2 }, // Silver
    // { id: 5, name: "VIP", isAdmin: false, defaultMembershipId: 5 },  // VIP - Not seeded
  ]);
}

async function seedAdminUser() {
  const hashedPassword = await bcrypt.hash("P@ssword2023", 10);
  return await User.create({
    firstname: "Admin",
    lastname: "Support",
    username: "Admin",
    email: "admin@noroff.no",
    password: hashedPassword,
    address: "Online",
    phone: "911",
    roleId: 1,
    membershipId: 1,
  });
}

async function seedTestUsers() {
  const testPassword = await bcrypt.hash("test123!", 10);
  return await User.bulkCreate([
    {
      firstname: "Test",
      lastname: "User",
      username: "testuser",
      email: "test@user.com",
      password: testPassword,
      address: "Test Address 5",
      phone: "12345678",
      roleId: 2,
      membershipId: 1,
    },
    {
      firstname: "Test",
      lastname: "Support",
      username: "support",
      email: "support@test.com",
      password: testPassword,
      address: "Support Road 1",
      phone: "99887766",
      roleId: 3,
      membershipId: 3,
    },
    {
      firstname: "Test",
      lastname: "Staff",
      username: "staff",
      email: "staff@test.com",
      password: testPassword,
      address: "Staff Avenue 2",
      phone: "11223344",
      roleId: 4,
      membershipId: 2,
    },
  ]);
}

async function importExternalProducts() {
  const response = await axios.get("http://backend.restapi.co.za/items/products");
  const products = response.data.data;

  const brandSet = new Set();
  const categorySet = new Set();

  products.forEach((p) => {
    brandSet.add(p.brand);
    categorySet.add(p.category);
  });

  const brandMap = {};
  const categoryMap = {};

  for (const brand of brandSet) {
    const b = await Brand.create({ name: brand });
    brandMap[brand] = b.id;
  }

  for (const category of categorySet) {
    const c = await Category.create({ name: category });
    categoryMap[category] = c.id;
  }

  for (const item of products) {
    if (!item.name || item.price == null || item.quantity == null) continue;

    await Product.create({
      name: item.name,
      description: item.description || "No description available",
      unitprice: item.price,
      quantity: item.quantity,
      imgurl: item.imgurl || "",
      date_added: new Date(),
      CategoryId: categoryMap[item.category],
      BrandId: brandMap[item.brand],
    });
  }
}

module.exports = {
  syncDatabase,
  checkIfAdminExists,
  seedMemberships,
  seedRoles,
  seedAdminUser,
  seedTestUsers,
  importExternalProducts,
};
