/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productName
 *         - unitprice
 *         - quantity
 *         - total
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         productName:
 *           type: string
 *           example: "Wireless Mouse"
 *         unitprice:
 *           type: number
 *           format: float
 *           example: 299.99
 *         quantity:
 *           type: integer
 *           example: 2
 *         total:
 *           type: number
 *           format: float
 *           example: 599.98
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-04T11:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-04T11:01:00Z"
 */
