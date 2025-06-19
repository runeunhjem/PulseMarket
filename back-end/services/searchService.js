const { sequelize } = require("../models");

async function searchProductsInDB({ name, brand, category, sort }) {
  const conditions = ["Products.isDeleted = 0"];
  const replacements = {};

  if (brand) {
    conditions.push("Brands.name = :brand");
    replacements.brand = brand.trim();
  }

  if (category) {
    conditions.push("Categories.name = :category");
    replacements.category = category.trim();
  }

  if (name) {
    conditions.push(`(
      Products.name LIKE :name OR
      Products.description LIKE :name
    )`);
    replacements.name = `%${name.trim()}%`;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

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

  const [results] = await sequelize.query(query, { replacements });
  return results;
}

module.exports = { searchProductsInDB };
