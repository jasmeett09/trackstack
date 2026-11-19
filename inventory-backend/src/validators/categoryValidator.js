const { body } = require("express-validator");

module.exports = [
  body("name").trim().notEmpty().withMessage("Category name is required."),
  body("description").optional({ checkFalsy: true }).trim()
];
