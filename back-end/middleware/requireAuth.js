const jwt = require("jsonwebtoken");
const { User, Membership } = require("../models");
require("dotenv").config();

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authorization header missing or malformed." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: {
        model: Membership,
        attributes: ["id", "name", "discount"],
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    req.user = {
      id: user.id,
      roleId: user.roleId,
      membership: user.Membership
        ? {
            id: user.Membership.id,
            name: user.Membership.name,
            discount: user.Membership.discount,
          }
        : null,
    };

    next();
  } catch (err) {
    console.error("❌ Auth error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = requireAuth;
