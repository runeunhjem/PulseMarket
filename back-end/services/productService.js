const { sequelize, Product, Category, Brand } = require("../models");

// Raw SQL product queries
async function getProductsFromDB(includeDeleted = false, categories = [], brands = [], sort = "created-desc") {
  const filters = [];
  const replacements = {};

  if (!includeDeleted) {
    filters.push("Products.isDeleted = 0");
  }

  if (categories.length) {
    filters.push(`LOWER(Categories.name) IN (:categoryNames)`);
    replacements.categoryNames = categories.map((c) => c.toLowerCase());
  }

  if (brands.length) {
    filters.push(`LOWER(Brands.name) IN (:brandNames)`);
    replacements.brandNames = brands.map((b) => b.toLowerCase());
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  let orderBy = "Products.createdAt DESC";
  if (sort === "price-asc") orderBy = "Products.unitprice ASC";
  else if (sort === "price-desc") orderBy = "Products.unitprice DESC";
  else if (sort === "name-asc") orderBy = "Products.name ASC";
  else if (sort === "name-desc") orderBy = "Products.name DESC";
  else if (sort === "created-asc") orderBy = "Products.createdAt ASC";

  const query = `
    SELECT
      Products.id,
      Products.name,
      Products.description,
      Products.unitprice,
      Products.quantity,
      Products.imgurl,
      Products.date_added,
      Products.createdAt,
      Products.updatedAt,
      Products.isDeleted,
      Products.BrandId,
      Products.CategoryId,
      Brands.name AS brand,
      Categories.name AS category
    FROM Products
    JOIN Brands ON Products.BrandId = Brands.id
    JOIN Categories ON Products.CategoryId = Categories.id
    ${whereClause}
    ORDER BY ${orderBy};
  `;

  const [products] = await sequelize.query(query, { replacements });
  return products;
}

async function getDeletedProductsFromDB() {
  const query = `
    SELECT
      Products.id,
      Products.name,
      Products.description,
      Products.unitprice,
      Products.quantity,
      Products.imgurl,
      Products.date_added,
      Products.createdAt,
      Products.updatedAt,
      Products.isDeleted,
      Products.BrandId,
      Products.CategoryId,
      Brands.name AS brand,
      Categories.name AS category
    FROM Products
    JOIN Brands ON Products.BrandId = Brands.id
    JOIN Categories ON Products.CategoryId = Categories.id
    WHERE Products.isDeleted = 1
    ORDER BY Products.createdAt DESC;
  `;
  const [products] = await sequelize.query(query);
  return products;
}

// Basic ORM operations
async function createProductInDB(productData) {
  return await Product.create(productData);
}

async function findProductById(id) {
  return await Product.findByPk(id);
}

async function updateProductInstance(product, updatedFields) {
  return await product.update(updatedFields);
}

async function findCategoryById(id) {
  return await Category.findByPk(id);
}

async function findBrandById(id) {
  return await Brand.findByPk(id);
}

module.exports = {
  getProductsFromDB,
  getDeletedProductsFromDB,
  createProductInDB,
  findProductById,
  updateProductInstance,
  findCategoryById,
  findBrandById,
};
