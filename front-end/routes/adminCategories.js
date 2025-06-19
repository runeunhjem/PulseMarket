const express = require("express");
const router = express.Router();
const axios = require("axios");

// GET /admin/categories
router.get("/", async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.token) {
      return res.redirect("/auth/login");
    }

    const token = user.token;
    const headers = { Authorization: `Bearer ${token}` };

    const [categoriesRes, brandsRes] = await Promise.all([
      axios.get("http://localhost:3001/api/categories", { headers }),
      axios.get("http://localhost:3001/api/brands", { headers }),
    ]);

    const categories = categoriesRes.data.data || [];
    const brands = brandsRes.data.data || [];

    res.render("adminCategories", {
      title: "Manage Categories",
      user,
      categories,
      brands,
    });
  } catch (err) {
    console.error("❌ Error rendering categories admin:", err.message);
    res.status(500).render("error", {
      title: "Error",
      error: { message: "Could not load admin categories page." },
    });
  }
});

module.exports = router;
