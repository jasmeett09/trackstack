const getActiveUser = (req) => req.user || req.apiUser;

const denyAccess = (req, res, message) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(403).json({ message });
  }

  req.flash("error_msg", message);
  return res.redirect("/dashboard");
};

const allowRoles = (...roles) => (req, res, next) => {
  const activeUser = getActiveUser(req);

  if (!activeUser) {
    return denyAccess(req, res, "Please log in to continue.");
  }

  if (!roles.includes(activeUser.role)) {
    return denyAccess(req, res, "You do not have permission to access this resource.");
  }

  return next();
};

module.exports = {
  allowRoles
};
