const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Safely get the first non-empty, trimmed value from a query param
const getCleanParam = (param) => {
  if (Array.isArray(param)) {
    return param.find((value) => value && value.trim())?.trim() || "";
  }
  return param?.trim?.() || "";
};

// GET /search (render search page with query filters)
router.get("/", async (req, res) => {
  try {
    const name = getCleanParam(req.query.name);
    const brand = getCleanParam(req.query.brand);
    const category = getCleanParam(req.query.category);
    const sort = getCleanParam(req.query.sort);
    const token = req.cookies.token || "";

    const searchResponse = await axios.post(
      `${BACKEND_URL}/search`,
      { name, brand, category, sort },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    const categoriesRes = await axios.get(`${BACKEND_URL}/categories`);
    const brandsRes = await axios.get(`${BACKEND_URL}/brands`);

    res.render("search", {
      title: "Search Results",
      products: searchResponse.data.data.results,
      filters: {
        categories: categoriesRes.data.data || [],
        brands: brandsRes.data.data || [],
        category: category ? [category] : [],
        brand: brand ? [brand] : [],
      },
      sort,
      formAction: "/search",
    });
  } catch (err) {
    console.error("❌ Search error (frontend GET):", err.message);
    res.status(500).render("error", {
      title: "Error",
      error: err,
    });
  }
});

// POST /search (fallback if form submits via POST)
router.post("/", async (req, res) => {
  try {
    const name = getCleanParam(req.body.name);
    const brand = getCleanParam(req.body.brand);
    const category = getCleanParam(req.body.category);
    const sort = getCleanParam(req.body.sort);
    const token = req.cookies.token || "";

    const searchResponse = await axios.post(
      `${BACKEND_URL}/search`,
      { name, brand, category, sort },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    const categoriesRes = await axios.get(`${BACKEND_URL}/categories`);
    const brandsRes = await axios.get(`${BACKEND_URL}/brands`);

    res.render("search", {
      title: "Search Results",
      products: searchResponse.data.data.results,
      filters: {
        categories: categoriesRes.data.data || [],
        brands: brandsRes.data.data || [],
        category: category ? [category] : [],
        brand: brand ? [brand] : [],
      },
      sort,
      formAction: "/search",
    });
  } catch (err) {
    console.error("❌ Search error (frontend POST):", err.message);
    res.status(500).render("error", {
      title: "Error",
      error: err,
    });
  }
});

module.exports = router;
