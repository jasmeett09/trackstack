module.exports = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({ message });
  }

  res.status(statusCode).render("error", {
    title: "Error",
    message,
    statusCode
  });
};
