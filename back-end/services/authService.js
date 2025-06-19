const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const User = require("../models/User");

async function checkIfEmailOrUsernameExists(email, username) {
  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ where: { email } }),
    User.findOne({ where: { username } }),
  ]);
  return { existingEmail, existingUsername };
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function createUser(userData) {
  return await User.create(userData);
}

async function findUserByIdentifier(identifier) {
  return await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { username: identifier }],
    },
    attributes: ["id", "username", "email", "password", "roleId", "membershipId", "isDeleted"],
  });
}

async function comparePasswords(plain, hashed) {
  return await bcrypt.compare(plain, hashed);
}

module.exports = {
  checkIfEmailOrUsernameExists,
  hashPassword,
  createUser,
  findUserByIdentifier,
  comparePasswords,
};
