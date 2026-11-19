const { body } = require("express-validator");

exports.inviteUserValidator = [
  body("email").isEmail().withMessage("Valid email is required."),
  body("role")
    .isIn(["manager", "staff"])
    .withMessage("Invited role must be manager or staff.")
];

exports.acceptInvitationValidator = [
  body("invitationId").trim().notEmpty().withMessage("Invitation id is required."),
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match.")
];

exports.updateOrganizationUserRoleValidator = [
  body("role")
    .isIn(["admin", "manager", "staff"])
    .withMessage("User role must be admin, manager, or staff.")
];

exports.updateProfileValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.")
];

exports.updateOrganizationSettingsValidator = [
  body("organizationName").trim().notEmpty().withMessage("Organization name is required.")
];
