// routes/orders.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// GET /orders - View user's own orders
router.get("/", async (req, res) => {
  const token = req.cookies.token || "";

  if (!req.session.user) {
    req.flash("error", "You must be logged in to view your orders.");
    return res.redirect("/auth/login");
  }

  try {
    const [ordersRes, membershipsRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URL}/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const orders = ordersRes.data.data || [];
    const memberships = membershipsRes.data.data || [];

    // Calculate total quantity purchased
    let totalQuantityPurchased = 0;
    orders.forEach((order) => {
      order.OrderItems.forEach((item) => {
        totalQuantityPurchased += item.quantity;
      });
    });

    res.render("orders", {
      title: "Your Orders",
      orders,
      user: req.session.user,
      memberships,
      totalQuantityPurchased,
    });
  } catch (err) {
    console.error("❌ Failed to load orders:", err.message);
    req.flash("error", "Could not load orders.");
    res.redirect("/");
  }
});


module.exports = router;
