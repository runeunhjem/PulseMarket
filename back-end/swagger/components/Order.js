/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - orderNumber
 *         - status
 *         - membershipName
 *         - discountUsed
 *         - userSnapshotName
 *         - userSnapshotEmail
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         orderNumber:
 *           type: string
 *           example: "A1B2C3D4"
 *         status:
 *           type: string
 *           enum: [In Progress, Ordered, Completed]
 *           example: "Ordered"
 *         membershipName:
 *           type: string
 *           example: "Gold"
 *         discountUsed:
 *           type: integer
 *           example: 15
 *         userSnapshotName:
 *           type: string
 *           example: "John Doe"
 *         userSnapshotEmail:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-04T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-04T10:15:00Z"
 */
