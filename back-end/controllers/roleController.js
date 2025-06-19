const { validateRoleInput } = require("../utils/validators");

const {
  getAllRolesFromDB,
  findRoleByName,
  findRoleById,
  createRoleInDB,
  updateRoleInstance,
  countUsersWithRole,
  deleteRoleInstance,
} = require("../services/roleService");

const getAllRoles = async (req, res) => {
  try {
    const roles = await getAllRolesFromDB();
    res.status(200).json({
      success: true,
      message: "Roles retrieved successfully.",
      data: roles,
    });
  } catch (err) {
    console.error("❌ Error retrieving roles:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve roles.",
    });
  }
};

const createRole = async (req, res) => {
  try {
    let { name, isAdmin = false, defaultMembershipId = null } = req.body;

    if (defaultMembershipId === "" || defaultMembershipId === undefined) {
      defaultMembershipId = null;
    }


    const error = validateRoleInput({ name, isAdmin, defaultMembershipId });
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to create role - ${error}` });
    }

    const existing = await findRoleByName(name.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Role '${name}' already exists.`,
      });
    }

    const role = await createRoleInDB({
      name: name.trim(),
      isAdmin,
      defaultMembershipId,
    });

    res.status(201).json({
      success: true,
      message: `Role '${role.name}' created successfully.`,
      data: role,
    });
  } catch (err) {
    console.error("❌ Error creating role:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create role.",
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isAdmin, defaultMembershipId } = req.body;

    const role = await findRoleById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role with ID ${id} not found.`,
      });
    }

    const error = validateRoleInput({
      name: name ?? role.name,
      isAdmin: isAdmin ?? role.isAdmin,
      defaultMembershipId: defaultMembershipId ?? role.defaultMembershipId,
    });

    if (error) {
      return res.status(400).json({ success: false, message: `Failed to update role - ${error}` });
    }

    if (name && name !== role.name) {
      const existing = await findRoleByName(name.trim());
      if (existing && existing.id !== role.id) {
        return res.status(409).json({
          success: false,
          message: `Role name '${name}' already exists.`,
        });
      }
    }

    await updateRoleInstance(role, {
      name: name ?? role.name,
      isAdmin: isAdmin ?? role.isAdmin,
      defaultMembershipId: defaultMembershipId ?? role.defaultMembershipId,
    });

    res.status(200).json({
      success: true,
      message: `Role '${role.name}' updated successfully.`,
      data: role,
    });
  } catch (err) {
    console.error("❌ Error updating role:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update role.",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await findRoleById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role with ID ${id} not found.`,
      });
    }

    const usersWithRole = await countUsersWithRole(id);
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role '${role.name}' — it is currently assigned to ${usersWithRole} user(s).`,
      });
    }

    await deleteRoleInstance(role);
    res.status(200).json({
      success: true,
      message: `Role '${role.name}' deleted successfully.`,
    });
  } catch (err) {
    console.error("❌ Error deleting role:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete role.",
    });
  }
};

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
};
