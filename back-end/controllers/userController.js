const {
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
} = require("../services/userService");

const { validateUserInput } = require("../utils/validators");
const { Role, Membership } = require("../models");
// VSC sugested import:
const { findRoleById } = require("../services/roleService");
const { findMembershipByName } = require("../services/membershipService");

// CREATE USER
const createUserHandler = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password, address, phone, roleId, membershipId } = req.body;

    const error = validateUserInput({
      firstname,
      lastname,
      username,
      email,
      password,
      phone,
      allowTestPassword: false,
    });
    if (error) return res.status(400).json({ success: false, message: `Failed to create user - ${error}` });

    const [existingEmail, existingUsername] = await Promise.all([findUserByEmail(email), findUserByUsername(username)]);
    if (existingEmail) return res.status(409).json({ success: false, message: "Email already in use." });
    if (existingUsername) return res.status(409).json({ success: false, message: "Username already taken." });

    const hashed = await hashPassword(password);
    const finalRoleId = roleId ?? 2;

    let finalMembershipId = membershipId;
    if (!finalMembershipId) {
      const role = await getRoleById(finalRoleId);
      finalMembershipId = role?.defaultMembershipId ?? 1;
    }

    const user = await createUser({
      firstname,
      lastname,
      username,
      email,
      password: hashed,
      address,
      phone,
      roleId: finalRoleId,
      membershipId: finalMembershipId,
    });

    res.status(201).json({
      success: true,
      message: `User '${user.username}' created successfully.`,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        membershipId: user.membershipId,
      },
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    const known = ["SequelizeValidationError", "SequelizeUniqueConstraintError"];
    if (known.includes(err.name)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors?.map((e) => e.message),
      });
    }
    res.status(500).json({ success: false, message: "Failed to create user." });
  }
};

// GET OWN USER
const getOwnUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: require("../models").Role, attributes: ["name"] },
        { model: require("../models").Membership, attributes: ["name", "discount"] },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("❌ Error fetching own user info:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user info." });
  }
};

// GET USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await findAllUsers({
      includeDeleted: req.query.includeDeleted === "true",
      onlyDeleted: req.query.onlyDeleted === "true",
    });

    const label =
      req.query.onlyDeleted === "true"
        ? "deactivated users"
        : req.query.includeDeleted === "true"
        ? "active and deactivated users"
        : "active users";

    res.status(200).json({ success: true, message: `Retrieved ${label} successfully.`, data: users });
  } catch (err) {
    console.error("❌ Error retrieving users:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: require("../models").Role, attributes: ["name"] },
        { model: require("../models").Membership, attributes: ["name", "discount"] },
      ],
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: "User retrieved.", data: user });
  } catch (err) {
    console.error("❌ Error getting user:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve user." });
  }
};

// UPDATE
const updateUserDetails = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, username, email, address, phone, role, membership } = req.body;

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const error = validateUserInput({
      firstname,
      lastname,
      username,
      email,
      phone,
      allowTestPassword: false,
    });

    if (error) return res.status(400).json({ success: false, message: `Failed to update user - ${error}` });

    const updates = { firstname, lastname, username, email, address, phone };

    // If role is present, map name to roleId
    if (role) {
      const foundRole = await Role.findOne({ where: { name: role } });
      if (!foundRole) return res.status(400).json({ success: false, message: `Role '${role}' does not exist.` });

      updates.roleId = foundRole.id;
    }

    // Accept either membershipId directly, or membership name
    if (req.body.membershipId) {
      updates.membershipId = req.body.membershipId;
    } else if (membership) {
      const foundMembership = await Membership.findOne({ where: { name: membership } });
      if (!foundMembership)
        return res.status(400).json({ success: false, message: `Membership '${membership}' does not exist.` });

      updates.membershipId = foundMembership.id;
    }

    await updateUser(user, updates);

    res.status(200).json({
      success: true,
      message: `User '${user.username}' updated successfully.`,
      data: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    const isValidation = ["SequelizeValidationError", "SequelizeUniqueConstraintError"].includes(err.name);
    const messages = err.errors?.map((e) => e.message) ?? [];

    return res.status(isValidation ? 400 : 500).json({
      success: false,
      message: isValidation ? "Validation failed" : "Failed to update user.",
      ...(messages.length && { errors: messages }),
    });
  }
};

const updateUserAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId, membership } = req.body;

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    let updatedFields = {};

    // If role is being changed, update both roleId and default membershipId
    if (roleId && roleId !== user.roleId) {
      const role = await findRoleById(roleId);
      if (!role) {
        return res.status(400).json({ success: false, message: "Invalid role ID." });
      }

      updatedFields.roleId = role.id;
      updatedFields.membershipId = role.defaultMembershipId;
    }

    if (membership) {
      const foundMembership = await findMembershipByName(membership);
      if (!foundMembership) {
        return res.status(400).json({ success: false, message: "Invalid membership." });
      }
      updatedFields.membershipId = foundMembership.id;
    }

    await updateUserInstance(user, updatedFields);

    res.status(200).json({
      success: true,
      message: "User access updated successfully.",
    });
  } catch (err) {
    console.error("❌ Error updating user access:", err);
    res.status(500).json({ success: false, message: "Failed to update user access." });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;
  const userId = req.params.id;

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (user.id === req.user.id) {
      return res.status(403).json({ success: false, message: "You cannot change your own role." });
    }

    const role = await getRoleById(roleId);
    if (!role) return res.status(404).json({ success: false, message: "Role not found." });

    const newMembershipId = role.defaultMembershipId ?? user.membershipId;

    await updateUser(user, { roleId, membershipId: newMembershipId });

    res.status(200).json({
      success: true,
      message: `User '${user.username}' role updated to '${role.name}', membership set to '${newMembershipId}'.`,
      data: { id: user.id, username: user.username, role: role.name, membershipId: user.membershipId },
    });
  } catch (err) {
    console.error("❌ Error updating user role:", err);
    res.status(500).json({ success: false, message: "Failed to update user role." });
  }
};

// SELF UPDATE
const updateOwnDetails = async (req, res) => {
  req.params.id = req.user.id;
  await updateUserDetails(req, res);
};

const updateOwnPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new password are required." });
  }

  try {
    const user = await findUserById(userId);
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    const hashed = await hashPassword(newPassword);
    await updateUser(user, { password: hashed });

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    res.status(500).json({ success: false, message: "Failed to update password." });
  }
};

const updateUserMembership = async (req, res) => {
  const { id } = req.params;
  const { membership } = req.body;

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // If frontend sends membership as string (e.g., "Gold"), find the correct ID
    const foundMembership = await findMembershipByName(membership);
    if (!foundMembership) {
      return res.status(404).json({ success: false, message: `Membership '${membership}' not found.` });
    }

    await updateUser(user, { membershipId: foundMembership.id });

    res.status(200).json({
      success: true,
      message: `User '${user.username}' membership updated to '${foundMembership.name}'.`,
      data: {
        id: user.id,
        username: user.username,
        membership: foundMembership.name,
        discount: foundMembership.discount,
      },
    });
  } catch (err) {
    console.error("❌ Error updating membership:", err);
    res.status(500).json({ success: false, message: "Failed to update user membership." });
  }
};

// DELETE / DEACTIVATE
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ success: false, message: "You cannot delete your own account." });
  }

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.roleId === 1) return res.status(403).json({ success: false, message: "Admin users cannot be deleted." });

    await destroyUser(user);
    res.status(200).json({ success: true, message: `User '${user.username}' deleted successfully.` });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};

const deactivateUser = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ success: false, message: "You cannot deactivate your own account." });
  }

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isDeleted) return res.status(400).json({ success: false, message: "User already deactivated." });

    await updateUser(user, { isDeleted: true });
    res.status(200).json({ success: true, message: `User '${user.username}' deactivated.` });
  } catch (err) {
    console.error("❌ Error deactivating user:", err);
    res.status(500).json({ success: false, message: "Failed to deactivate user." });
  }
};

const reactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserByIdParanoidFalse(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.isDeleted) return res.status(400).json({ success: false, message: "User is not deactivated." });

    await updateUser(user, { isDeleted: false });
    res.status(200).json({ success: true, message: `User '${user.username}' reactivated.` });
  } catch (err) {
    console.error("❌ Error reactivating user:", err);
    res.status(500).json({ success: false, message: "Failed to reactivate user." });
  }
};

module.exports = {
  createUser: createUserHandler,
  getOwnUser,
  getAllUsers,
  getUserById,
  updateUserDetails,
  updateUserAccess,
  updateUserRole,
  updateUserMembership,
  updateOwnDetails,
  updateOwnPassword,
  deleteUser,
  deactivateUser,
  reactivateUser,
};
