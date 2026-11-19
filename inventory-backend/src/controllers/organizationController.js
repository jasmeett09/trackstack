const asyncHandler = require("../utils/asyncHandler");
const auditLogService = require("../services/auditLogService");
const auditTrailService = require("../services/auditTrailService");
const notificationService = require("../services/notificationService");
const organizationService = require("../services/organizationService");
const { buildOpenApiSpec } = require("../config/openapi");
const { disconnectUserSockets } = require("../config/socket");

exports.apiOrganizationSummary = asyncHandler(async (req, res) => {
  const organization = await organizationService.getOrganizationSummary(req.user._id || req.user.id);
  res.json({ organization });
});

exports.apiUpdateOrganizationSettings = asyncHandler(async (req, res) => {
  const organization = await organizationService.updateOrganizationSettings(
    req.user._id || req.user.id,
    req.body
  );

  await auditLogService.logActivity({
    organizationId: req.user.organizationId,
    userId: req.user.id || req.user._id,
    action: "organization.updated_settings",
    entity: "Organization",
    details: {
      organizationId: organization.id,
      organizationName: organization.organizationName
    }
  });

  await notificationService.createNotification({
    organizationId: req.user.organizationId,
    actorUserId: req.user.id || req.user._id,
    type: "organization.settings.updated",
    title: "Organization updated",
    message: `Organization name changed to ${organization.organizationName}.`,
    entity: "Organization",
    entityId: organization.id,
    metadata: {
      organizationName: organization.organizationName
    }
  });

  res.json({
    message: "Organization updated successfully.",
    organization
  });
});

exports.apiOrganizationUsers = asyncHandler(async (req, res) => {
  const users = await organizationService.getOrganizationUsers(req.user._id || req.user.id);
  res.json(users);
});

exports.apiOrganizationInvitations = asyncHandler(async (req, res) => {
  const invitations = await organizationService.getOrganizationInvitations(req.user._id || req.user.id);
  res.json(invitations);
});

exports.apiInvitationDetails = asyncHandler(async (req, res) => {
  const invitation = await organizationService.getInvitationDetails(req.params.invitationId);
  res.json({ invitation });
});

exports.apiInviteUser = asyncHandler(async (req, res) => {
  const invitation = await organizationService.inviteUserToOrganization(req.user._id || req.user.id, req.body);
  const appOrigin = (process.env.FRONTEND_URL || req.get("origin") || "http://localhost:5173").replace(/\/$/, "");
  const inviteLink = `${appOrigin}/accept-invitation/${invitation.id}`;

  await auditLogService.logActivity({
    organizationId: req.user.organizationId,
    userId: req.user.id || req.user._id,
    action: "organization.invited_user",
    entity: "Invitation",
    details: {
      email: invitation.email,
      role: invitation.role
    }
  });

  await notificationService.createNotification({
    organizationId: req.user.organizationId,
    actorUserId: req.user.id || req.user._id,
    type: "organization.invitation.created",
    title: "New team invitation created",
    message: `${invitation.email} was invited as ${invitation.role}.`,
    entity: "Invitation",
    metadata: {
      email: invitation.email,
      role: invitation.role
    }
  });

  res.status(201).json({
    message: "Invitation created successfully.",
    invitation,
    inviteLink
  });
});

exports.apiOrganizationActivityLogs = asyncHandler(async (req, res) => {
  const logs = await auditTrailService.getOrganizationActivityLogs(req.user._id || req.user.id);
  res.json(logs);
});

exports.apiOrganizationInventoryLogs = asyncHandler(async (req, res) => {
  const logs = await auditTrailService.getOrganizationInventoryLogs(req.user._id || req.user.id);
  res.json(logs);
});

exports.apiDocs = asyncHandler(async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json(buildOpenApiSpec(baseUrl));
});

exports.apiUpdateOrganizationUserRole = asyncHandler(async (req, res) => {
  const updatedUser = await organizationService.updateOrganizationUserRole(
    req.user._id || req.user.id,
    req.params.userId,
    req.body.role
  );

  await auditLogService.logActivity({
    organizationId: req.user.organizationId,
    userId: req.user.id || req.user._id,
    action: "organization.updated_user_role",
    entity: "User",
    details: {
      targetUserId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });

  await notificationService.createNotification({
    organizationId: req.user.organizationId,
    actorUserId: req.user.id || req.user._id,
    type: "organization.user.role_updated",
    title: "Team member role updated",
    message: `${updatedUser.email} is now ${updatedUser.role}.`,
    entity: "User",
    entityId: updatedUser.id,
    metadata: {
      email: updatedUser.email,
      role: updatedUser.role
    }
  });

  res.json({
    message: "User role updated successfully.",
    user: updatedUser
  });
});

exports.apiRemoveOrganizationUser = asyncHandler(async (req, res) => {
  const removedUser = await organizationService.removeOrganizationUser(
    req.user._id || req.user.id,
    req.params.userId
  );
  disconnectUserSockets(removedUser.id);

  await auditLogService.logActivity({
    organizationId: req.user.organizationId,
    userId: req.user.id || req.user._id,
    action: "organization.removed_user",
    entity: "User",
    details: {
      targetUserId: removedUser.id,
      email: removedUser.email,
      role: removedUser.role
    }
  });

  await notificationService.createNotification({
    organizationId: req.user.organizationId,
    actorUserId: req.user.id || req.user._id,
    type: "organization.user.removed",
    title: "Team member removed",
    message: `${removedUser.email} was removed from the organization.`,
    entity: "User",
    entityId: removedUser.id,
    metadata: {
      email: removedUser.email,
      role: removedUser.role
    }
  });

  res.json({
    message: "User removed successfully."
  });
});

exports.apiRevokeInvitation = asyncHandler(async (req, res) => {
  const invitation = await organizationService.revokeOrganizationInvitation(
    req.user._id || req.user.id,
    req.params.invitationId
  );

  await auditLogService.logActivity({
    organizationId: req.user.organizationId,
    userId: req.user.id || req.user._id,
    action: "organization.revoked_invitation",
    entity: "Invitation",
    details: {
      email: invitation.email,
      role: invitation.role
    }
  });

  await notificationService.createNotification({
    organizationId: req.user.organizationId,
    actorUserId: req.user.id || req.user._id,
    type: "organization.invitation.revoked",
    title: "Invitation revoked",
    message: `The invite for ${invitation.email} was revoked.`,
    entity: "Invitation",
    metadata: {
      email: invitation.email,
      role: invitation.role
    }
  });

  res.json({
    message: "Invitation revoked successfully.",
    invitation
  });
});
