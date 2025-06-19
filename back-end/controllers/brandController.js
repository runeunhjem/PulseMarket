const {
  getAllBrandsFromDB,
  findBrandByName,
  createBrandInDB,
  findBrandById,
  updateBrandInDB,
  countProductsUsingBrand,
  deleteBrandById,
} = require("../services/brandService");

// GET /brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await getAllBrandsFromDB();
    res.json({ success: true, data: brands });
  } catch (err) {
    console.error("❌ Error fetching brands:", err);
    res.status(500).json({ success: false, message: "Failed to fetch brands." });
  }
};

// POST /brands
const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });

    const existing = await findBrandByName(name);
    if (existing) return res.status(409).json({ success: false, message: "Brand already exists." });

    const brand = await createBrandInDB(name);
    res.status(201).json({ success: true, data: brand });
  } catch (err) {
    console.error("❌ Error creating brand:", err);
    res.status(500).json({ success: false, message: "Failed to create brand." });
  }
};

// PUT /brands/:id
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });

    const brand = await findBrandById(id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found." });

    const updated = await updateBrandInDB(brand, name);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating brand:", err);
    res.status(500).json({ success: false, message: "Failed to update brand." });
  }
};

// DELETE /brands/:id
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const count = await countProductsUsingBrand(id);
    if (count > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete brand in use by products." });
    }

    const deleted = await deleteBrandById(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Brand not found." });

    res.json({ success: true, message: "Brand deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};
