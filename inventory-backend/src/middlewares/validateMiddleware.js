const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const messages = errors.array().map((error) => error.msg);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(422).json({ errors: messages });
  }

  req.flash("error_msg", messages.join(" "));
  return res.redirect("back");
};
