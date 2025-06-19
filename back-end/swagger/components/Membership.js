/**
 * @swagger
 * components:
 *   schemas:
 *     Membership:
 *       type: object
 *       required:
 *         - name
 *         - minQty
 *         - discount
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Gold"
 *         minQty:
 *           type: integer
 *           minimum: 0
 *           example: 10
 *         maxQty:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           example: 50
 *         discount:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 15
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-03T09:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-03T11:30:00Z"
 */
