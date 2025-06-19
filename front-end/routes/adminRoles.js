const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;

    const [rolesRes, membershipsRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const roles = rolesRes.data.data;
    const memberships = membershipsRes.data.data;

    res.render("adminRoles", {
      title: "Manage Roles",
      roles,
      memberships,
    });
  } catch (err) {
    console.error("❌ Error loading roles:", err.message);
    res.render("error", { title: "Error", filters: {} });
  }
});

module.exports = router;
