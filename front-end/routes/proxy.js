const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/image", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send("Missing image URL");
  }

  try {
    const allowedHost = "images.restapi.co.za";
    const urlObj = new URL(imageUrl);

    if (urlObj.hostname !== allowedHost) {
      return res.status(403).send("Forbidden image domain");
    }

    const response = await axios.get(imageUrl, { responseType: "stream" });
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (error) {
    console.error("Image proxy failed:", error.message);
    res.status(500).send("Image proxy failed");
  }
});

module.exports = router;
