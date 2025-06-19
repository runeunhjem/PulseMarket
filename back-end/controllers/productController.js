const {
  getProductsFromDB,
  getDeletedProductsFromDB,
  createProductInDB,
  findProductById,
  updateProductInstance,
  findCategoryById,
  findBrandById,
} = require("../services/productService");

const { validateProductInput } = require("../utils/validators");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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


const getProducts = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === "true";
    let isAdmin = false;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if (decoded && decoded.roleId === 1) isAdmin = true;
      } catch (err) {
        console.warn("⚠️ Invalid token ignored:", err.message);
      }
    }

    const categories = parseFilterParam(req.query.category);
    const brands = parseFilterParam(req.query.brand);
    const sort = Array.isArray(req.query.sort) ? req.query.sort[0] : req.query.sort || "created-desc";

    const showDeleted = isAdmin && includeDeleted;
    const products = await getProductsFromDB(showDeleted, categories, brands, sort);

    res.status(200).json({
      success: true,
      message: `Retrieved ${products.length} product${products.length === 1 ? "" : "s"} successfully.`,
      data: {
        result: "Filtered product list",
        filters: { category: categories, brand: brands },
        products,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found.`,
      });
    }

    const category = await findCategoryById(product.CategoryId);
    const brand = await findBrandById(product.BrandId);

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      unitprice: product.unitprice,
      quantity: product.quantity,
      imgurl: product.imgurl,
      category: category?.name || "Unknown",
      brand: brand?.name || "Unknown",
    };

    return res.status(200).json({
      success: true,
      message: `Product ${productId} retrieved successfully.`,
      data: result,
    });
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};


const getDeletedProducts = async (req, res) => {
  try {
    const products = await getDeletedProductsFromDB();
    return res.status(200).json({
      success: true,
      message: `Retrieved ${products.length} soft-deleted product${products.length === 1 ? "" : "s"} successfully.`,
      data: {
        result: "Deleted product list",
        products,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching deleted products:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deleted products.",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, unitprice, quantity, imgurl, CategoryId, BrandId } = req.body;

    const error = validateProductInput({ name, unitprice, quantity, CategoryId, BrandId });
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to create product - ${error}` });
    }

    const category = await findCategoryById(CategoryId);
    const brand = await findBrandById(BrandId);
    if (!category || !brand) {
      return res.status(404).json({ success: false, message: "Invalid CategoryId or BrandId." });
    }

    const product = await createProductInDB({
      name: name.trim(),
      description,
      unitprice,
      quantity,
      imgurl,
      CategoryId,
      BrandId,
      date_added: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Product '${product.name}' created successfully.`,
      data: product,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, unitprice, quantity, imgurl, CategoryId, BrandId } = req.body;

  try {
    const product = await findProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`,
      });
    }

    const error = validateProductInput({
      name: name ?? product.name,
      unitprice: unitprice ?? product.unitprice,
      quantity: quantity ?? product.quantity,
      CategoryId: CategoryId ?? product.CategoryId,
      BrandId: BrandId ?? product.BrandId,
    });

    if (error) {
      return res.status(400).json({ success: false, message: `Failed to update product - ${error}` });
    }

    await updateProductInstance(product, {
      name: name ?? product.name,
      description: description ?? product.description,
      unitprice: unitprice ?? product.unitprice,
      quantity: quantity ?? product.quantity,
      imgurl: imgurl ?? product.imgurl,
      CategoryId: CategoryId ?? product.CategoryId,
      BrandId: BrandId ?? product.BrandId,
    });

    return res.status(200).json({
      success: true,
      message: `Product '${product.name}' updated successfully.`,
      data: product,
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const softDeleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await findProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`,
      });
    }

    if (product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `Product '${product.name}' (ID: ${product.id}) is already deleted.`,
      });
    }

    await updateProductInstance(product, { isDeleted: true });

    return res.json({
      success: true,
      message: `Product '${product.name}' (ID: ${product.id}) was soft-deleted successfully.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const restoreProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await findProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`,
      });
    }

    if (!product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `Product '${product.name}' is not deleted.`,
      });
    }

    await updateProductInstance(product, { isDeleted: false });

    return res.status(200).json({
      success: true,
      message: `Product '${product.name}' (ID: ${product.id}) was restored successfully.`,
    });
  } catch (err) {
    console.error("❌ Error restoring product:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to restore product.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  getDeletedProducts,
};
