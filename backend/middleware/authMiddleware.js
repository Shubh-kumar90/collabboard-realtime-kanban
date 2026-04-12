exports.isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized - Please login" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};