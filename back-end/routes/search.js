const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/searchController");

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Product search functionality
 */

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Search for products
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "mouse"
 *               category:
 *                 type: string
 *                 example: "Accessories"
 *               brand:
 *                 type: string
 *                 example: "Logitech"
 *     responses:
 *       200:
 *         description: Search results returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid search query
 */
router.post("/", searchProducts);

module.exports = router;
