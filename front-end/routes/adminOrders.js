const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Show all orders for admin
router.get("/", async (req, res) => {
  const token = req.cookies.token;

  try {
    const response = await axios.get(`${BACKEND_URL}/orders/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.render("adminOrders", {
      orders: response.data.data || [],
      success: req.flash("success"),
      error: req.flash("error"),
      user: req.session.user,
      requestPath: req.originalUrl,
    });
  } catch (err) {
    console.error("❌ Error loading orders:", err.message);
    req.flash("error", "Failed to load orders.");
    res.redirect("/dashboard");
  }
});

// Update order status
router.patch("/:id/status", async (req, res) => {
  const token = req.cookies.token;
  const { status } = req.body;

  try {
    const response = await axios.patch(
      `${BACKEND_URL}/orders/${req.params.id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ Error updating order status:", err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || "Failed to update order status.",
    });
  }
});

module.exports = router;
