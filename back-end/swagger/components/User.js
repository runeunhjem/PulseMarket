/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: User data returned by the API (excluding password)
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         firstname:
 *           type: string
 *           example: "John"
 *         lastname:
 *           type: string
 *           example: "Doe"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           example: "johndoe@example.com"
 *         address:
 *           type: string
 *           example: "Example Street 123"
 *         phone:
 *           type: string
 *           example: "12345678"
 *         roleId:
 *           type: integer
 *           example: 2
 *         membershipId:
 *           type: integer
 *           example: 1
 *         isDeleted:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCreate:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - username
 *         - email
 *         - password
 *         - address
 *         - phone
 *       properties:
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         roleId:
 *           type: integer
 *         membershipId:
 *           type: integer
 */
