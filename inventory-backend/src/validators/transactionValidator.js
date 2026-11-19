const { body } = require("express-validator");

module.exports = [
  body("item").notEmpty().withMessage("Item is required."),
  body("transactionType")
    .isIn(["stock-in", "stock-out"])
    .withMessage("Transaction type must be stock-in or stock-out."),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1."),
  body("note").optional({ checkFalsy: true }).trim()
];
