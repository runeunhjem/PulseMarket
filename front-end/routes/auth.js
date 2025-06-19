const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const BACKEND_URL = process.env.BACKEND_URL;

// GET login
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login", cssFile: "auth", filters: {} });
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      identifier: username,
      password,
    });

    const loginData = response.data.data;
    const token = loginData.token;

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
      token,
    };

    res.cookie("token", token, { httpOnly: true });

    // Fetch cart count
    const cartResponse = await axios.get(`${BACKEND_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartItems = cartResponse.data?.data || [];
    req.session.user.cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    req.flash("success", "Logged in successfully.");

    req.session.save(() => {
      return res.redirect(fullUser.roleId === 1 ? "/dashboard" : "/products");
    });
  } catch (err) {
    const message = err.response?.data?.message || "Login failed. Please try again.";
    req.flash("error", message);
    res.redirect("/auth/login");
  }
});

// GET signup
router.get("/signup", (req, res) => {
  res.render("auth/signup", { title: "Sign Up", cssFile: "auth", filters: {} });
});

// POST signup
router.post("/signup", async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/register`, req.body);

    const { token, user } = response.data.data;

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      role: user.Role,
      membership: user.Membership,
      token,
    };
    res.cookie("token", token, { httpOnly: true });

    req.flash("success", "Account created and logged in.");
    res.redirect("/products");
  } catch (err) {
    const message = err.response?.data?.message || "Registration failed. Please try again.";

    const {
      firstname = "",
      lastname = "",
      username = "",
      email = "",
      address = "",
      phone = "",
    } = req.body;

    return res.render("auth/signup", {
      title: "Sign Up",
      cssFile: "auth",
      filters: {},
      error: message,
      formData: { firstname, lastname, username, email, address, phone },
    });
  }
});

// GET logout
router.get("/logout", (req, res) => {
  req.flash("success", "You have been logged out.");
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/products");
    }
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

module.exports = router;
