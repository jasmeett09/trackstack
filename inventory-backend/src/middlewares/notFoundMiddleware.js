module.exports = (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ message: "Route not found." });
  }

  return res.status(404).render("error", {
    title: "404 Not Found",
    message: "The requested page was not found.",
    statusCode: 404
  });
};
