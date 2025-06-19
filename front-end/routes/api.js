const express = require("express");
const router = express.Router();
const axios = require("axios");

router.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Categories
router.get("/categories", async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/categories`);
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
});

// Brands
router.get("/brands", async (req, res) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/brands${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.session.token}`,
        },
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("❌ Error in /api/brands:", err);
    res.status(500).json({ success: false, message: "Failed to load brands." });
  }
});

// Add to cart
router.post("/cart", async (req, res) => {
  const token = req.cookies.token || "";

  try {
    const response = await axios.post(`${BACKEND_URL}/cart`, req.body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const cartCountResponse = await axios.get(`${BACKEND_URL}/cart`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const cartItems = cartCountResponse.data?.data || [];
    const newCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (req.session.user) {
      req.session.user.cartCount = newCartCount;
      res.locals.user = req.session.user;
    }

    req.flash("success", response.data.message || "Item added to cart.");
    req.session.save(() => res.redirect("back"));
  } catch (err) {
    console.error("Error adding to cart:", err.message);
    req.flash("error", err.response?.data?.message || "Failed to add item to cart.");
    req.session.save(() => res.redirect("back"));
  }
});

// Update product
router.put("/products/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.put(`${BACKEND_URL}/products/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating product:", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, message: "Failed to update product." });
  }
});

// Soft-delete product
router.delete("/products/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.delete(`${BACKEND_URL}/products/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, message: "Failed to delete product." });
  }
});

// Restore product
router.patch("/products/:id/restore", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/products/${req.params.id}/restore`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error restoring product:", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, message: "Failed to restore product." });
  }
});

// Create new product
router.post("/products", async (req, res) => {
  const token = req.cookies.token || "";

  try {
    const response = await axios.post(`${BACKEND_URL}/products`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { success: false, message: "Failed to create product." });
  }
});

// CREATE category
router.post("/categories", async (req, res) => {

  const token = req.cookies.token || "";
  try {
    const response = await axios.post(`${BACKEND_URL}/categories`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error creating category:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to create category.",
      }
    );
  }
});

// UPDATE category
router.put("/categories/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.put(`${BACKEND_URL}/categories/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update category.",
      }
    );
  }
});

// TOGGLE category visibility
router.patch("/categories/:id/toggle", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/categories/${req.params.id}/toggle`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error toggling category:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to toggle category.",
      }
    );
  }
});

// DELETE category
router.delete("/categories/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.delete(`${BACKEND_URL}/categories/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to delete category.",
      }
    );
  }
});

// CREATE brand
router.post("/brands", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.post(`${BACKEND_URL}/brands`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error creating brand:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to create brand.",
      }
    );
  }
});

// UPDATE brand
router.put("/brands/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.put(`${BACKEND_URL}/brands/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating brand:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update brand.",
      }
    );
  }
});

// TOGGLE brand visibility
router.patch("/brands/:id/toggle", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/brands/${req.params.id}/toggle`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error toggling brand:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to toggle brand.",
      }
    );
  }
});

// DELETE brand
router.delete("/brands/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.delete(`${BACKEND_URL}/brands/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error deleting brand:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to delete brand.",
      }
    );
  }
});

// ==================== USERS (ADMIN) ====================

// CREATE new user
router.post("/users", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.post(`${BACKEND_URL}/users`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to create user.",
      }
    );
  }
});

// GET all users (including deleted)
router.get("/users", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.get(`${BACKEND_URL}/users?includeDeleted=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
});

// UPDATE user details (name, email, etc.)
router.put("/users/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.put(`${BACKEND_URL}/users/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update user.",
      }
    );
  }
});

// CREATE role
router.post("/roles", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.post(`${BACKEND_URL}/roles`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error creating role:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to create role.",
      }
    );
  }
});

// UPDATE role
router.put("/roles/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.put(`${BACKEND_URL}/roles/${req.params.id}`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating role:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update role.",
      }
    );
  }
});

// DELETE role
router.delete("/roles/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.delete(`${BACKEND_URL}/roles/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error deleting role:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to delete role.",
      }
    );
  }
});

// UPDATE user role
router.patch("/users/:id/role", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(`${BACKEND_URL}/users/${req.params.id}/role`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating user role:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update user role.",
      }
    );
  }
});

// UPDATE user membership
router.patch("/users/:id/membership", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(`${BACKEND_URL}/users/${req.params.id}/membership`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating user membership:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update user membership.",
      }
    );
  }
});

// CHANGE own password
router.patch("/users/me/password", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(`${BACKEND_URL}/users/me/password`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error changing password:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to change password.",
      }
    );
  }
});

// DELETE user permanently
router.delete("/users/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.delete(`${BACKEND_URL}/users/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to delete user.",
      }
    );
  }
});

// DEACTIVATE user (soft delete)
router.patch("/users/:id/deactivate", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/users/${req.params.id}/deactivate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error deactivating user:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to deactivate user.",
      }
    );
  }
});

// REACTIVATE user (undo soft delete)
router.patch("/users/:id/reactivate", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/users/${req.params.id}/reactivate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error reactivating user:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to reactivate user.",
      }
    );
  }
});

// CREATE membership
router.post("/memberships", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.post(`${BACKEND_URL}/memberships`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error creating membership:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to create membership.",
      }
    );
  }
});

// UPDATE membership
router.put("/memberships/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.put(`${BACKEND_URL}/memberships/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error updating membership:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to update membership.",
      }
    );
  }
});

// DELETE membership
router.delete("/memberships/:id", async (req, res) => {
  const token = req.cookies.token || "";
  try {
    const response = await axios.delete(`${BACKEND_URL}/memberships/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Error deleting membership:", err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        success: false,
        message: "Failed to delete membership.",
      }
    );
  }
});

module.exports = router;
