const express = require("express");
const router = express.Router();
const { initSystem } = require("../controllers/initController");

/**
 * @swagger
 * tags:
 *   name: Init
 *   description: One-time system initialization
 */

/**
 * @swagger
 * /init:
 *   post:
 *     summary: Initialize the system with default data
 *     tags: [Init]
 *     description: Sets up roles, memberships, and the initial admin user. Should only be run once.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 example: true
 *                 description: If true, forces re-initialization (for development/testing only)
 *     responses:
 *       200:
 *         description: System initialized or already initialized
 *       400:
 *         description: Initialization failed
 */
router.post("/", initSystem);

module.exports = router;
