/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - unitprice
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         name:
 *           type: string
 *           example: "Bluetooth Speaker"
 *         description:
 *           type: string
 *           example: "A compact Bluetooth speaker with deep bass."
 *         unitprice:
 *           type: number
 *           format: float
 *           example: 499.99
 *         imgurl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/images/speaker.jpg"
 *         quantity:
 *           type: integer
 *           example: 25
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         date_added:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T14:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T14:01:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-03T08:00:00Z"
 */
