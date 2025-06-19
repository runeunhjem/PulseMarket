/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Support"
 *         isAdmin:
 *           type: boolean
 *           example: true
 *         defaultMembershipId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-02T09:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-03T08:15:00Z"
 */
