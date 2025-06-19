const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// GET /dashboard
router.get("/", async (req, res) => {
  const token = req.cookies.token || "";

  if (!req.session.user || req.session.user.roleId !== 1) {
    req.flash("error", "Access denied. Admins only.");
    return res.redirect("/");
  }

  try {
    const [productsRes, categoriesRes, brandsRes, usersRes, ordersRes, membershipsRes, rolesRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { includeDeleted: true },
      }),
      axios.get(`${BACKEND_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/brands`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { includeDeleted: true },
      }),
      axios.get(`${BACKEND_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const allProducts = productsRes.data.data?.products || [];
    const deletedCount = allProducts.filter((p) => p.isDeleted).length;
    const visibleCount = allProducts.length - deletedCount;

    const allUsers = usersRes.data.data || [];
    const deactivatedCount = allUsers.filter((u) => u.isDeleted).length;
    const activeCount = allUsers.length - deactivatedCount;

    res.render("dashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      stats: {
        products: visibleCount,
        deletedProducts: deletedCount,
        categories: categoriesRes.data.data?.length || 0,
        brands: brandsRes.data.data?.length || 0,
        users: activeCount,
        deactivatedUsers: deactivatedCount,
        orders: ordersRes.data.data?.length || 0,
        memberships: membershipsRes.data.data?.length || 0,
        roles: rolesRes.data.data?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ Failed to load dashboard stats:", err.message);
    req.flash("error", "Could not load dashboard overview.");
    res.redirect("/");
  }
});

module.exports = router;
