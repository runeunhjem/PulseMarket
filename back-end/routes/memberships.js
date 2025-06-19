const express = require("express");
const router = express.Router();
const controller = require("../controllers/membershipController");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

/**
 * @swagger
 * tags:
 *   name: Memberships
 *   description: Manage user membership levels
 */

/**
 * @swagger
 * /memberships:
 *   get:
 *     summary: Get all memberships
 *     tags: [Memberships]
 *     responses:
 *       200:
 *         description: List of memberships retrieved
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
 *                     $ref: '#/components/schemas/Membership'
 */
router.get("/", controller.getAllMemberships);

/**
 * @swagger
 * /memberships:
 *   post:
 *     summary: Create a new membership
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Membership'
 *     responses:
 *       201:
 *         description: Membership created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Membership name already exists
 */
router.post("/", requireAuth, requireAdmin, controller.createMembership);

/**
 * @swagger
 * /memberships/{id}:
 *   put:
 *     summary: Update a membership
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Membership ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Membership'
 *     responses:
 *       200:
 *         description: Membership updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Membership not found
 */
router.put("/:id", requireAuth, requireAdmin, controller.updateMembership);

/**
 * @swagger
 * /memberships/{id}:
 *   delete:
 *     summary: Delete a membership
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: Membership deleted successfully
 *       400:
 *         description: Cannot delete membership (in use)
 *       404:
 *         description: Membership not found
 */
router.delete("/:id", requireAuth, requireAdmin, controller.deleteMembership);

module.exports = router;
