const { Role, Membership, User } = require("../models");

async function getAllRolesFromDB() {
  return await Role.findAll({
    include: {
      model: Membership,
      as: "defaultMembership",
      attributes: ["id", "name", "discount", "minQty", "maxQty"],
    },
    order: [["id", "ASC"]],
  });
}

async function findRoleByName(name) {
  return await Role.findOne({ where: { name } });
}

async function findRoleById(id) {
  return await Role.findByPk(id);
}

async function createRoleInDB({ name, isAdmin, defaultMembershipId }) {
  return await Role.create({ name, isAdmin, defaultMembershipId });
}

async function updateRoleInstance(role, updatedFields) {
  return await role.update(updatedFields);
}

async function countUsersWithRole(id) {
  return await User.count({ where: { roleId: id } });
}

async function deleteRoleInstance(role) {
  return await role.destroy();
}

module.exports = {
  getAllRolesFromDB,
  findRoleByName,
  findRoleById,
  createRoleInDB,
  updateRoleInstance,
  countUsersWithRole,
  deleteRoleInstance,
};
