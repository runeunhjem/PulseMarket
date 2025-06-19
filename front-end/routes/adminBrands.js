const express = require("express");
const router = express.Router();
const axios = require("axios");

// GET /admin/brands
router.get("/", async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.token) {
      return res.redirect("/auth/login");
    }

    const token = user.token;
    const headers = { Authorization: `Bearer ${token}` };

    const [brandsRes, categoriesRes] = await Promise.all([
      axios.get("http://localhost:3001/api/brands", { headers }),
      axios.get("http://localhost:3001/api/categories", { headers }),
    ]);

    const brands = brandsRes.data.data || [];
    const categories = categoriesRes.data.data || [];

    res.render("adminBrands", {
      title: "Manage Brands",
      user,
      brands,
      categories,
    });
  } catch (err) {
    console.error("❌ Error rendering brands admin:", err.message);
    res.status(500).render("error", {
      title: "Error",
      error: { message: "Could not load admin brands page." },
    });
  }
});

module.exports = router;
