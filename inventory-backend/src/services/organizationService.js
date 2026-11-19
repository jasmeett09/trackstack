const { randomUUID } = require("node:crypto");
const { prisma } = require("../config/prisma");
const authService = require("./authService");
const { getTenantContext } = require("./tenantService");

const sanitizeUser = (user) => ({
  id: user.id,
  _id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  organizationId: user.organizationId,
  organizationName: user.organization?.organizationName || ""
});

const ensureAdminTenant = async (userId) => {
  const tenant = await getTenantContext(userId);

  if (tenant.user.role !== "admin") {
    const error = new Error("Only organization admins can perform this action.");
    error.statusCode = 403;
    throw error;
  }

  return tenant;
};

const getOrganizationSummary = async (userId) => {
  const { user } = await getTenantContext(userId);

  const memberCount = await prisma.user.count({
    where: { organizationId: user.organizationId }
  });

  return {
    id: user.organization.id,
    _id: user.organization.id,
    organizationName: user.organization.organizationName,
    createdAt: user.organization.createdAt,
    createdBy: user.organization.createdBy,
    memberCount
  };
};

const updateOrganizationSettings = async (userId, { organizationName }) => {
  const tenant = await ensureAdminTenant(userId);
  const trimmedName = organizationName.trim();

  const duplicateOrganization = await prisma.organization.findFirst({
    where: {
      organizationName: trimmedName,
      id: {
        not: tenant.organizationId
      }
    }
  });

  if (duplicateOrganization) {
    const error = new Error("Organization name is already in use.");
    error.statusCode = 409;
    throw error;
  }

  return prisma.organization.update({
    where: { id: tenant.organizationId },
    data: {
      organizationName: trimmedName
    }
  });
};

const getOrganizationUsers = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const users = await prisma.user.findMany({
    where: { organizationId },
    include: { organization: true },
    orderBy: { createdAt: "asc" }
  });

  return users.map(sanitizeUser);
};

const getOrganizationInvitations = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  return prisma.invitation.findMany({
    where: { organizationId },
    include: {
      organization: true
    },
    orderBy: { createdAt: "desc" }
  });
};

const inviteUserToOrganization = async (userId, { email, role }) => {
  const tenant = await ensureAdminTenant(userId);

  const normalizedEmail = email.toLowerCase();

  const [existingUser, existingInvite] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalizedEmail } }),
    prisma.invitation.findFirst({
      where: {
        organizationId: tenant.organizationId,
        email: normalizedEmail,
        status: "pending"
      }
    })
  ]);

  if (existingUser) {
    const error = new Error("A user with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  if (existingInvite) {
    const error = new Error("A pending invitation already exists for this email.");
    error.statusCode = 409;
    throw error;
  }

  return prisma.invitation.create({
    data: {
      id: randomUUID(),
      organizationId: tenant.organizationId,
      invitedById: tenant.userId,
      email: normalizedEmail,
      role
    },
    include: {
      organization: true
    }
  });
};

const updateOrganizationUserRole = async (actorUserId, targetUserId, role) => {
  const tenant = await ensureAdminTenant(actorUserId);

  if (tenant.userId === targetUserId) {
    const error = new Error("Admins cannot change their own role.");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      organizationId: tenant.organizationId
    },
    include: {
      organization: true
    }
  });

  if (!targetUser) {
    const error = new Error("Organization user not found.");
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.role === "admin" && role !== "admin") {
    const adminCount = await prisma.user.count({
      where: {
        organizationId: tenant.organizationId,
        role: "admin"
      }
    });

    if (adminCount <= 1) {
      const error = new Error("At least one admin must remain in the organization.");
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUser.id },
    data: { role },
    include: {
      organization: true
    }
  });

  return sanitizeUser(updatedUser);
};

const removeOrganizationUser = async (actorUserId, targetUserId) => {
  const tenant = await ensureAdminTenant(actorUserId);

  if (tenant.userId === targetUserId) {
    const error = new Error("Admins cannot remove themselves from the organization.");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      organizationId: tenant.organizationId
    }
  });

  if (!targetUser) {
    const error = new Error("Organization user not found.");
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.role === "admin") {
    const adminCount = await prisma.user.count({
      where: {
        organizationId: tenant.organizationId,
        role: "admin"
      }
    });

    if (adminCount <= 1) {
      const error = new Error("At least one admin must remain in the organization.");
      error.statusCode = 400;
      throw error;
    }
  }

  await prisma.user.delete({
    where: { id: targetUser.id }
  });

  return targetUser;
};

const revokeOrganizationInvitation = async (actorUserId, invitationId) => {
  const tenant = await ensureAdminTenant(actorUserId);

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      organizationId: tenant.organizationId
    },
    include: {
      organization: true
    }
  });

  if (!invitation) {
    const error = new Error("Invitation not found.");
    error.statusCode = 404;
    throw error;
  }

  if (invitation.status !== "pending") {
    const error = new Error("Only pending invitations can be revoked.");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await prisma.invitation.update({
      where: { id: invitation.id, status: "pending", organizationId: tenant.organizationId },
      data: { status: "revoked" },
      include: { organization: true }
    });
  } catch (error) {
    if (error.code !== "P2025") throw error;
    const inactiveInvitation = new Error("Invitation is no longer pending.");
    inactiveInvitation.statusCode = 409;
    throw inactiveInvitation;
  }
};

const getInvitationDetails = async (invitationId) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: {
      organization: true
    }
  });

  if (!invitation) {
    const error = new Error("Invitation not found.");
    error.statusCode = 404;
    throw error;
  }

  if (invitation.status !== "pending") {
    const error = new Error("Invitation is no longer active.");
    error.statusCode = 410;
    throw error;
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    organizationId: invitation.organizationId,
    organizationName: invitation.organization.organizationName,
    createdAt: invitation.createdAt
  };
};

const acceptInvitation = async ({ invitationId, name, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      email: normalizedEmail,
      status: "pending"
    },
    include: {
      organization: true
    }
  });

  if (!invitation) {
    const error = new Error("Invitation not found or already used.");
    error.statusCode = 404;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    const error = new Error("A user with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await authService.hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const { count } = await tx.invitation.updateMany({
      where: { id: invitation.id, status: "pending" },
      data: { status: "accepted" }
    });
    if (!count) {
      const error = new Error("Invitation not found or already used.");
      error.statusCode = 404;
      throw error;
    }

    return tx.user.create({
      data: {
        organizationId: invitation.organizationId,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: invitation.role
      },
      include: {
        organization: true
      }
    });

  });

  return authService.decorateUser(user);
};

module.exports = {
  getOrganizationSummary,
  updateOrganizationSettings,
  getOrganizationUsers,
  getOrganizationInvitations,
  getInvitationDetails,
  inviteUserToOrganization,
  updateOrganizationUserRole,
  removeOrganizationUser,
  revokeOrganizationInvitation,
  acceptInvitation
};
