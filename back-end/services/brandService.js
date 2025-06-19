const { Product, Brand } = require("../models");

// Get all brands
async function getAllBrandsFromDB() {
  return await Brand.findAll();
}

// Find a brand by its ID
async function findBrandById(id) {
  return await Brand.findByPk(id);
}

// Find a brand by its name
async function findBrandByName(name) {
  return await Brand.findOne({ where: { name } });
}

// Create a new brand
async function createBrandInDB(name) {
  return await Brand.create({ name });
}

// Update a brand's name
async function updateBrandInDB(brand, name) {
  brand.name = name;
  return await brand.save();
}

// Count how many products use this brand (excluding deleted)
async function countProductsUsingBrand(id) {
  return await Product.count({ where: { BrandId: id, isDeleted: false } });
}

// Permanently delete a brand
async function deleteBrandById(id) {
  return await Brand.destroy({ where: { id } });
}

module.exports = {
  getAllBrandsFromDB,
  findBrandById,
  findBrandByName,
  createBrandInDB,
  updateBrandInDB,
  countProductsUsingBrand,
  deleteBrandById,
};
