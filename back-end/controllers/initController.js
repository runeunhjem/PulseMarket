const {
  syncDatabase,
  checkIfAdminExists,
  seedMemberships,
  seedRoles,
  seedAdminUser,
  seedTestUsers,
  importExternalProducts,
} = require("../services/initService");

const initSystem = async (req, res) => {
  try {
    const { force } = req.body;

    await syncDatabase(!!force);

    const existingAdmin = await checkIfAdminExists();
    if (existingAdmin && !force) {
      return res.status(403).json({
        success: false,
        message: "System already initialized.",
      });
    }

    await seedMemberships();
    await seedRoles();
    await seedAdminUser();
    await seedTestUsers();
    await importExternalProducts();

    return res.status(200).json({
      success: true,
      message: force ? "System re-initialized successfully (forced)." : "System initialized successfully.",
    });
  } catch (err) {
    console.error("❌ Initialization failed:", err);
    return res.status(500).json({
      success: false,
      message: "Initialization failed.",
    });
  }
};

module.exports = { initSystem };
