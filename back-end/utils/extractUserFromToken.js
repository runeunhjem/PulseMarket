const jwt = require("jsonwebtoken");
const SECRET = process.env.TOKEN_SECRET;

function extractUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.split(" ")[1];
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = extractUserFromToken;
