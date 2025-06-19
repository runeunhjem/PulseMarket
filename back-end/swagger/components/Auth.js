/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         firstname:
 *           type: string
 *           example: John
 *         lastname:
 *           type: string
 *           example: Doe
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: P@ssword123
 *         address:
 *           type: string
 *           example: 123 Example Street
 *         phone:
 *           type: string
 *           example: 12345678

 *     LoginRequest:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           description: Username or email
 *           example: admin@noroff.no
 *         password:
 *           type: string
 *           format: password
 *           example: P@ssword2023

 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         roleId:
 *           type: integer
 *           example: 2
 *         membershipId:
 *           type: integer
 *           example: 1

 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 */
