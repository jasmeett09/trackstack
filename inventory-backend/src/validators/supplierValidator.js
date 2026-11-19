const { body } = require("express-validator");

module.exports = [
  body("name").trim().notEmpty().withMessage("Supplier name is required."),
  body("contactPerson").optional({ checkFalsy: true }).trim(),
  body("phone").optional({ checkFalsy: true }).trim(),
  body("address").optional({ checkFalsy: true }).trim()
];
