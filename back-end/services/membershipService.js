const { Membership, User } = require("../models");

async function getAllMembershipsFromDB() {
  return await Membership.findAll();
}

async function createMembershipInDB({ name, minQty, maxQty, discount }) {
  return await Membership.create({ name, minQty, maxQty, discount });
}

async function findMembershipById(id) {
  return await Membership.findByPk(id);
}

async function updateMembershipById(membership, updatedValues) {
  return await membership.update(updatedValues);
}

async function countUsersWithMembership(id) {
  return await User.count({ where: { membershipId: id } });
}

async function deleteMembershipByInstance(membership) {
  return await membership.destroy();
}

async function findMembershipByName(name) {
  return await Membership.findOne({ where: { name } });
}

module.exports = {
  getAllMembershipsFromDB,
  createMembershipInDB,
  findMembershipById,
  updateMembershipById,
  countUsersWithMembership,
  deleteMembershipByInstance,
  findMembershipByName,
};
