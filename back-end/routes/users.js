const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     description: This route is implemented and returns a clean version of the logged-in user's data, but is not yet used in the frontend.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/me", requireAuth, controller.getOwnUser);

/**
 * @swagger
 * /users/me/details:
 *   patch:
 *     summary: Update current user's profile
 *     description: This route is implemented and allows users to update their basic details. Not yet used in the frontend.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/me/details", requireAuth, controller.updateOwnDetails);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change password for current user
 *     description: This route is implemented but not yet linked in the frontend.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated
 */
router.patch("/me/password", requireAuth, controller.updateOwnPassword);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 */
router.get("/", requireAuth, requireAdmin, controller.getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/", requireAuth, requireAdmin, controller.createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get("/:id", requireAuth, requireAdmin, controller.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 */
router.put("/:id", requireAuth, requireAdmin, controller.updateUserDetails);

/**
 * @swagger
 * /users/{id}/details:
 *   patch:
 *     summary: Update user details (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User details updated
 */
router.patch("/:id/details", requireAuth, requireAdmin, controller.updateUserDetails);

/**
 * @swagger
 * /users/{id}/access:
 *   patch:
 *     summary: Update user role and membership (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *               membershipId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User access updated
 */
router.patch("/:id/access", requireAuth, requireAdmin, controller.updateUserAccess);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Change user's role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId]
 *             properties:
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/:id/role", requireAuth, requireAdmin, controller.updateUserRole);

/**
 * @swagger
 * /users/{id}/membership:
 *   patch:
 *     summary: Change user's membership (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [membershipId]
 *             properties:
 *               membershipId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Membership updated
 */
router.patch("/:id/membership", requireAuth, requireAdmin, controller.updateUserMembership);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.patch("/:id/deactivate", requireAuth, requireAdmin, controller.deactivateUser);

/**
 * @swagger
 * /users/{id}/reactivate:
 *   patch:
 *     summary: Reactivate user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User reactivated
 */
router.patch("/:id/reactivate", requireAuth, requireAdmin, controller.reactivateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Permanently delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/:id", requireAuth, requireAdmin, controller.deleteUser);

module.exports = router;
