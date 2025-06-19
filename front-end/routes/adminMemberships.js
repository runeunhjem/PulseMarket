const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role?.name !== "Admin") {
    req.flash("error", "Access denied.");
    return res.redirect("/auth/login");
  }
  next();
}

// GET /admin/memberships
router.get("/", requireAdmin, async (req, res) => {
  try {
    const token = req.cookies.token || "";
    const response = await axios.get(`${BACKEND_URL}/memberships`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const memberships = response.data.data;
    res.render("adminMemberships", { memberships });
  } catch (err) {
    console.error("❌ Error loading memberships page:", err.message);
    req.flash("error", "Failed to load memberships.");
    res.render("adminMemberships", { memberships: [] });
  }
});

module.exports = router;
