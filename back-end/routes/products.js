const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product browsing and management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all visible products (with optional filters)
 *     tags: [Products]
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Comma-separated list of category names
 *       - name: brand
 *         in: query
 *         schema:
 *           type: string
 *         description: Comma-separated list of brand names
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *         description: Sort order (e.g., created-desc, price-asc)
 *     responses:
 *       200:
 *         description: Product list returned
 */
router.get("/", controller.getProducts);

/**
 * @swagger
 * /products/deleted:
 *   get:
 *     summary: Get all soft-deleted products (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deleted products
 *       404:
 *         description: No deleted products found
 */
router.get("/deleted", requireAuth, requireAdmin, controller.getDeletedProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details returned
 *       404:
 *         description: Product not found
 */
router.get("/:id", controller.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", requireAuth, requireAdmin, controller.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/:id", requireAuth, requireAdmin, controller.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Soft-delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product soft-deleted
 *       404:
 *         description: Product not found
 */
router.delete("/:id", requireAuth, requireAdmin, controller.softDeleteProduct);

/**
 * @swagger
 * /products/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product restored
 *       404:
 *         description: Product not found
 */
router.patch("/:id/restore", requireAuth, requireAdmin, controller.restoreProduct);

module.exports = router;
