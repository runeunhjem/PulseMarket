const express = require("express");
const router = express.Router();
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const parseFilterParam = (param) => {
  if (Array.isArray(param)) return param.filter((v) => v.trim() !== "");
  if (typeof param === "string") {
    return param
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
  }
  return [];
};

router.get("/", async (req, res) => {
  try {
    const user = req.session.user || null;

    const { category, brand } = req.query;
    const sort = Array.isArray(req.query.sort) ? req.query.sort[0] : req.query.sort || "created-desc";
    let includeDeleted = req.query.includeDeleted === "true";
    if (!req.session.user || req.session.user.roleId !== 1) {
      includeDeleted = false;
    }

    const token = req.cookies.token || "";

    const categoryArray = parseFilterParam(category);
    const brandArray = parseFilterParam(brand);

    const response = await axios.get(`${BACKEND_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: {
        category: categoryArray,
        brand: brandArray,
        sort,
        includeDeleted,
      },
      paramsSerializer: (params) => new URLSearchParams(params).toString(),
    });

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const [categoriesRes, brandsRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/categories`, { headers }),
      axios.get(`${BACKEND_URL}/brands`, { headers }),
    ]);

    const categoriesSorted = [...(categoriesRes.data.data || [])].sort((a, b) => a.name.localeCompare(b.name));
    const brandsSorted = [...(brandsRes.data.data || [])].sort((a, b) => a.name.localeCompare(b.name));

    const isAdmin = user?.roleId === 1;

    let cartItems = [];
    if (token) {
      try {
        const cartRes = await axios.get(`${BACKEND_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        cartItems = cartRes.data.data.items || [];
      } catch (err) {
        console.warn("⚠️ Failed to fetch cart items:", err.message);
      }
    }

    res.render(isAdmin ? "adminProducts" : "products", {
      title: "Products",
      user,
      products: response.data.data?.products || [],
      cartItems,
      filters: {
        category: categoryArray,
        brand: brandArray,
        categories: categoriesSorted,
        brands: brandsSorted,
      },
      sort,
      includeDeleted,
      formAction: "/products",
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).render("error", {
      title: "Error",
      error: err,
    });
  }
});

router.get("/partial", async (req, res) => {
  try {
    const user = req.session.user || null;
    const { category, brand } = req.query;
    const sort = Array.isArray(req.query.sort) ? req.query.sort[0] : req.query.sort || "created-desc";
    let includeDeleted = req.query.includeDeleted === "true";

    if (!user || user.roleId !== 1) includeDeleted = false;

    const token = req.cookies.token || "";
    const categoryArray = parseFilterParam(category);
    const brandArray = parseFilterParam(brand);

    const response = await axios.get(`${BACKEND_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: {
        category: categoryArray,
        brand: brandArray,
        sort,
        includeDeleted,
      },
      paramsSerializer: (params) => new URLSearchParams(params).toString(),
    });

    const products = response.data.data?.products || [];

    res.render("partials/adminProductTableRows", { products }, (err, html) => {
      if (err) return res.status(500).send("Failed to render partial");
      res.send(html);
    });
  } catch (err) {
    console.error("❌ Error fetching partial table:", err.message);
    res.status(500).send("Error loading updated table");
  }
});

router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  const token = req.cookies.token || "";

  try {
    const productResponse = await axios.get(`${BACKEND_URL}/products/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const product = productResponse.data.data;

    if (!product) {
      return res.status(404).render("error", {
        title: "Product Not Found",
        error: { message: `No product found with ID ${productId}` },
      });
    }

    res.render("productDetails", {
      title: product.name,
      product,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error("❌ Failed to load product details:", err.message);
    res.status(500).render("error", {
      title: "Error",
      error: err,
    });
  }
});

module.exports = router;
