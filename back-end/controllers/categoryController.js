const {
  getAllCategoriesFromDB,
  createCategoryInDB,
  findCategoryById,
  updateCategoryName,
  countProductsUsingCategory,
  deleteCategoryById,
} = require("../services/categoryService");

const { validateCategoryName } = require("../utils/validators");

// GET /categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesFromDB();
    res.status(200).json({
      success: true,
      message: `Retrieved ${categories.length} categor${categories.length === 1 ? "y" : "ies"}.`,
      data: categories,
    });
  } catch (err) {
    console.error("❌ Failed to fetch categories:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const error = validateCategoryName(name);
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to create category - ${error}` });
    }

    const category = await createCategoryInDB(name.trim());
    res.status(201).json({
      success: true,
      message: `Category '${category.name}' created successfully.`,
      data: category,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Failed to create category - Category '${req.body.name}' already exists.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create category - Internal server error.",
    });
  }
};

// PUT /categories/:id
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await findCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const error = validateCategoryName(name);
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to update category - ${error}` });
    }

    const oldName = category.name;
    const updated = await updateCategoryName(category, name.trim());

    res.json({
      success: true,
      message: `Category '${oldName}' updated to '${updated.name}'.`,
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update category." });
  }
};

// DELETE /categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const inUse = await countProductsUsingCategory(id);
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Category with id ${id} is in use and cannot be deleted.`,
      });
    }

    const deleted = await deleteCategoryById(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Category with id ${id} not found.`,
      });
    }

    return res.json({
      success: true,
      message: `Category with id ${id} deleted successfully.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
