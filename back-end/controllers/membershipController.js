const { validateMembershipInput } = require("../utils/validators");

const {
  getAllMembershipsFromDB,
  createMembershipInDB,
  findMembershipById,
  updateMembershipById,
  countUsersWithMembership,
  deleteMembershipByInstance,
} = require("../services/membershipService");

const getAllMemberships = async (req, res) => {
  try {
    const memberships = await getAllMembershipsFromDB();
    res.status(200).json({
      success: true,
      message: "Memberships retrieved successfully.",
      data: memberships,
    });
  } catch (err) {
    console.error("❌ Error retrieving memberships:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve memberships.",
    });
  }
};

const createMembership = async (req, res) => {
  try {
    const { name, minQty, maxQty, discount } = req.body;

    const error = validateMembershipInput({ name, minQty, maxQty, discount });
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to create membership - ${error}` });
    }

    const membership = await createMembershipInDB({ name: name.trim(), minQty, maxQty, discount });
    res.status(201).json({
      success: true,
      message: `Membership '${membership.name}' created successfully.`,
      data: membership,
    });
  } catch (err) {
    console.error("❌ Error creating membership:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create membership.",
    });
  }
};

const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, minQty, maxQty, discount } = req.body;

    const membership = await findMembershipById(id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: `Membership with ID ${id} not found.`,
      });
    }

    const error = validateMembershipInput({ name, minQty, maxQty, discount });
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to update membership - ${error}` });
    }

    await updateMembershipById(membership, { name: name.trim(), minQty, maxQty, discount });
    res.status(200).json({
      success: true,
      message: `Membership '${membership.name}' updated successfully.`,
      data: membership,
    });
  } catch (err) {
    console.error("❌ Error updating membership:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update membership.",
    });
  }
};

const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await findMembershipById(id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: `Membership with ID ${id} not found.`,
      });
    }

    const usersWithMembership = await countUsersWithMembership(id);
    if (usersWithMembership > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete membership '${membership.name}' — it is currently assigned to ${usersWithMembership} user(s).`,
      });
    }

    await deleteMembershipByInstance(membership);
    return res.status(200).json({
      success: true,
      message: `Membership '${membership.name}' deleted successfully.`,
    });
  } catch (err) {
    console.error("❌ Error deleting membership:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete membership.",
    });
  }
};

module.exports = {
  getAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
};
