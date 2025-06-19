const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.roleId !== 1) {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

module.exports = requireAdmin;
