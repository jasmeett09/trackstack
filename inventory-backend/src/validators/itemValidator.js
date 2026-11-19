const { body } = require("express-validator");

module.exports = [
  body("name").trim().notEmpty().withMessage("Item name is required."),
  body("category").notEmpty().withMessage("Category is required."),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be zero or greater."),
  body("unit").trim().notEmpty().withMessage("Unit is required."),
  body("supplier").notEmpty().withMessage("Supplier is required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be positive."),
  body("description").optional({ checkFalsy: true }).trim()
];
