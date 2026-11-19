const { body } = require("express-validator");

module.exports = [
  body("item").notEmpty().withMessage("Item is required."),
  body("customerName").optional({ checkFalsy: true }).trim(),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be zero or greater."),
  body("note").optional({ checkFalsy: true }).trim()
];
