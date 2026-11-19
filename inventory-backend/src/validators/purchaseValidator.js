const { body } = require("express-validator");

module.exports = [
  body("item").notEmpty().withMessage("Item is required."),
  body("supplier").notEmpty().withMessage("Supplier is required."),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
  body("purchasePrice")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be zero or greater."),
  body("note").optional({ checkFalsy: true }).trim()
];
