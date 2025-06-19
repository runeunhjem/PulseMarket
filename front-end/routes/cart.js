const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// GET /cart
router.get("/", async (req, res) => {
  const token = req.cookies.token || "";

  if (!req.session.user) {
    req.flash("error", "You must be logged in to view your cart.");
    return res.redirect("/auth/login");
  }

  try {
    const cartResponse = await axios.get(`${BACKEND_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartItems = cartResponse.data.data || [];
    const discountPercent = req.session.user.membership?.discount || 0;
    const membershipName = req.session.user.membership?.name || "None";

    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    for (const item of cartItems) {
      const total = item.quantity * item.Product.unitprice;
      totalBeforeDiscount += total;
      totalAfterDiscount += total * (1 - discountPercent / 100);
    }

    req.session.user.cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    res.render("cart", {
      title: "Your Cart",
      cartItems,
      user: req.session.user,
      discountPercent,
      membershipName,
      totalBeforeDiscount: totalBeforeDiscount.toFixed(2),
      totalAfterDiscount: totalAfterDiscount.toFixed(2),
      cssFile: "cart",
    });
  } catch (err) {
    console.error("❌ Failed to load cart:", err.message);
    res.status(500).render("error", { title: "Error", error: err });
  }
});

// POST /cart/update/:productId
router.post("/update/:productId", async (req, res) => {
  const token = req.cookies.token || "";
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    await axios.post(
      `${BACKEND_URL}/cart/update/${productId}`,
      { quantity },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    req.flash("success", "Quantity updated.");
    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Failed to update quantity:", err.message);
    req.flash("error", "Could not update quantity.");
    res.redirect("/cart");
  }
});

// POST /cart/remove/:productId
router.post("/remove/:productId", async (req, res) => {
  const token = req.cookies.token || "";
  const { productId } = req.params;

  try {
    await axios.delete(`${BACKEND_URL}/cart/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.flash("success", "Item removed.");
    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Failed to remove item:", err.message);
    req.flash("error", "Could not remove item.");
    res.redirect("/cart");
  }
});

// POST /cart/clear
router.post("/clear", async (req, res) => {
  const token = req.cookies.token || "";

  try {
    await axios.delete(`${BACKEND_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.flash("success", "Cart cleared.");
    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Failed to clear cart:", err.message);
    req.flash("error", "Could not clear cart.");
    res.redirect("/cart");
  }
});

// Checkout cart
router.post("/checkout", async (req, res) => {
  const token = req.cookies.token || "";

  try {
    const response = await axios.post(`${BACKEND_URL}/cart/checkout/now`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.status === 201 && response.data.success) {
      // Refresh session with updated membership info
      const userResponse = await axios.get(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fullUser = userResponse.data.data;
      req.session.user = {
        id: fullUser.id,
        username: fullUser.username,
        email: fullUser.email,
        roleId: fullUser.roleId,
        role: fullUser.Role,
        membership: fullUser.Membership,
      };

      // Optional: recalculate cart count
      const cartResponse = await axios.get(`${BACKEND_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = cartResponse.data?.data || [];
      req.session.user.cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      req.flash("success", response.data.message || "Order placed successfully.");
      return res.redirect("/orders");
    }

    // ❗ This only runs if the above condition fails
    req.flash("error", "Order might have been created, but response was unexpected. Check orders.");
    return res.redirect("/orders");
  } catch (err) {
    console.error("❌ Failed to checkout cart:", err.response?.data || err.message);
    req.flash("error", err.response?.data?.message || "Checkout failed.");
    return res.redirect("/cart");
  }
});




module.exports = router;
