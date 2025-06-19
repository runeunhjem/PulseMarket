const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;

    const [userRes, roleRes, membershipRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/users?includeDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const users = userRes.data.data;
    const roles = roleRes.data.data;
    const memberships = membershipRes.data.data;

    res.render("adminUsers", {
      title: "Manage Users",
      users,
      roles,
      memberships,
    });
  } catch (err) {
    console.error("❌ Failed to fetch users, roles, or memberships:", err.message);
    res.render("error", { title: "Error", filters: {} });
  }
});


module.exports = router;
