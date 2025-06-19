/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - quantity
 *         - userId
 *         - productId
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         userId:
 *           type: integer
 *           example: 3
 *         productId:
 *           type: integer
 *           example: 7
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-03T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-03T12:30:00Z"
 */
