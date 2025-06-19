const express = require("express");
const router = express.Router();
const controller = require("../controllers/cartController");
const requireAuth = require("../middleware/requireAuth");

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Manage user's shopping cart
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 */
router.get("/", requireAuth, controller.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 3
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 *       400:
 *         description: Invalid input or product unavailable
 */
router.post("/", requireAuth, controller.addToCart);

/**
 * @swagger
 * /cart/update/{productId}:
 *   post:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID in cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart quantity updated
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Cart item not found
 */
router.post("/update/:productId", requireAuth, controller.updateCartQuantity);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID in cart
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Item not found
 */
router.delete("/:productId", requireAuth, controller.deleteFromCart);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete("/", requireAuth, controller.clearCart);

/**
 * @swagger
 * /cart/checkout/now:
 *   post:
 *     summary: Checkout current cart immediately
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created from cart
 *       400:
 *         description: Cart is empty or invalid
 */
router.post("/checkout/now", requireAuth, controller.checkoutCart);

module.exports = router;
