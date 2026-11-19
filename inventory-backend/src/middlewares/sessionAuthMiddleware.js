module.exports = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  req.flash("error_msg", "Please log in to continue.");
  return res.redirect("/login");
};
