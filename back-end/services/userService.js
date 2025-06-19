const { User, Role, Membership } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

// Find single user by various identifiers
async function findUserById(id, options = {}) {
  return await User.findByPk(id, options);
}

async function findUserByEmail(email) {
  return await User.findOne({ where: { email } });
}

async function findUserByUsername(username) {
  return await User.findOne({ where: { username } });
}

async function findUserByIdParanoidFalse(id) {
  return await User.findByPk(id, { paranoid: false });
}

// Get all users (with optional deletion filters)
async function findAllUsers({ includeDeleted = false, onlyDeleted = false }) {
  const where = {};
  if (onlyDeleted) {
    where.isDeleted = true;
  } else if (!includeDeleted) {
    where.isDeleted = false;
  }

  return await User.findAll({
    where,
    attributes: { exclude: ["password"] },
    include: [
      { model: Role, attributes: ["name"] },
      { model: Membership, attributes: ["name", "discount"] },
    ],
    order: [["createdAt", "DESC"]],
  });
}

// User creation and password logic
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function createUser(data) {
  return await User.create(data);
}

async function updateUser(user, data) {
  return await user.update(data);
}

async function comparePassword(input, hash) {
  return await bcrypt.compare(input, hash);
}

// Role and membership lookups
async function getRoleById(id) {
  return await Role.findByPk(id);
}

async function getMembershipById(id) {
  return await Membership.findByPk(id);
}

// Hard delete user
async function destroyUser(user) {
  return await user.destroy();
}

module.exports = {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  findUserByIdParanoidFalse,
  findAllUsers,
  hashPassword,
  createUser,
  updateUser,
  comparePassword,
  getRoleById,
  getMembershipById,
  destroyUser,
};
