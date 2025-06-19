const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Home", filters: {} });
});

router.get("/categories", async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/categories`);
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
});

router.get("/brands", async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/brands`);
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching brands:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch brands." });
  }
});

module.exports = router;
