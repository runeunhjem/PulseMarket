const { validateSearchInput } = require("../utils/validators");
const { searchProductsInDB } = require("../services/searchService");

const searchProducts = async (req, res) => {
  const { name, brand, category, sort } = req.body;

  const error = validateSearchInput({ name, brand, category });
  if (error && (name || brand || category)) {
    return res.status(400).json({ success: false, message: `Invalid search input - ${error}` });
  }

  try {
    const results = await searchProductsInDB({ name, brand, category, sort });

    res.status(200).json({
      success: true,
      message: "Search completed.",
      data: {
        count: results.length,
        results,
      },
    });
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ success: false, message: "Search failed." });
  }
};

module.exports = { searchProducts };
