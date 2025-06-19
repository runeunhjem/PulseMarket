const { Category, Product } = require("../models");

// Get all categories
async function getAllCategoriesFromDB() {
  return await Category.findAll();
}

// Find category by ID
async function findCategoryById(id) {
  return await Category.findByPk(id);
}

// Create a new category
async function createCategoryInDB(name) {
  return await Category.create({ name });
}

// Update a category's name
async function updateCategoryName(category, newName) {
  category.name = newName;
  return await category.save();
}

// Count how many products are using this category (excluding deleted)
async function countProductsUsingCategory(id) {
  return await Product.count({ where: { CategoryId: id, isDeleted: false } });
}

// Permanently delete a category
async function deleteCategoryById(id) {
  return await Category.destroy({ where: { id } });
}

module.exports = {
  getAllCategoriesFromDB,
  findCategoryById,
  createCategoryInDB,
  updateCategoryName,
  countProductsUsingCategory,
  deleteCategoryById,
};
