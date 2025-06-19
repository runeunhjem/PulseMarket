const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Render backend landing page
 *     description: Displays a styled page for the PulseMarket backend. Useful for developers. Links to the front-end and Swagger documentation.
 *     tags: [Misc]
 *     responses:
 *       200:
 *         description: Renders backend landing page (HTML)
 */

router.get("/", function (req, res, next) {
  res.render("index", { title: "PulseMarket API" });
});

module.exports = router;
