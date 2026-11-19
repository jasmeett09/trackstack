jest.mock("../src/config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn()
    },
    invitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    organization: {
      findUnique: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

jest.mock("../src/services/tenantService", () => ({
  getTenantContext: jest.fn()
}));

jest.mock("../src/services/authService", () => ({
  hashPassword: jest.fn(async (value) => `hashed:${value}`),
  decorateUser: jest.fn((user) => ({ ...user, _id: user.id, organization: user.organization || null }))
}));

const { prisma } = require("../src/config/prisma");
const { getTenantContext } = require("../src/services/tenantService");
const organizationService = require("../src/services/organizationService");

describe("organizationService guardrails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTenantContext.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "admin",
        organizationId: "org-1"
      },
      userId: "admin-1",
      organizationId: "org-1"
    });
  });

  test("blocks demoting the last remaining admin", async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: "member-1",
      email: "lead@org.com",
      role: "admin",
      organizationId: "org-1",
      organization: { organizationName: "Org One" }
    });
    prisma.user.count.mockResolvedValue(1);

    await expect(
      organizationService.updateOrganizationUserRole("admin-1", "member-1", "manager")
    ).rejects.toMatchObject({
      message: "At least one admin must remain in the organization.",
      statusCode: 400
    });
  });

  test("updates a member role inside the same organization", async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: "member-2",
      email: "staff@org.com",
      role: "staff",
      organizationId: "org-1",
      organization: { organizationName: "Org One" }
    });
    prisma.user.update.mockResolvedValue({
      id: "member-2",
      email: "staff@org.com",
      role: "manager",
      organizationId: "org-1",
      createdAt: new Date("2026-05-01T10:00:00.000Z"),
      organization: { organizationName: "Org One" }
    });

    const result = await organizationService.updateOrganizationUserRole("admin-1", "member-2", "manager");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "member-2" },
      data: { role: "manager" },
      include: { organization: true }
    });
    expect(result.role).toBe("manager");
  });

  test("blocks removing the last remaining admin", async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: "member-1",
      email: "lead@org.com",
      role: "admin",
      organizationId: "org-1"
    });
    prisma.user.count.mockResolvedValue(1);

    await expect(
      organizationService.removeOrganizationUser("admin-1", "member-1")
    ).rejects.toMatchObject({
      message: "At least one admin must remain in the organization.",
      statusCode: 400
    });
  });

  test("revokes only pending invitations inside the same organization", async () => {
    prisma.invitation.findFirst.mockResolvedValue({
      id: "invite-1",
      email: "new@org.com",
      role: "staff",
      status: "pending",
      organizationId: "org-1",
      organization: { organizationName: "Org One" }
    });
    prisma.invitation.update.mockResolvedValue({
      id: "invite-1",
      email: "new@org.com",
      role: "staff",
      status: "revoked",
      organizationId: "org-1",
      organization: { organizationName: "Org One" }
    });

    const result = await organizationService.revokeOrganizationInvitation("admin-1", "invite-1");

    expect(prisma.invitation.update).toHaveBeenCalledWith({
      where: { id: "invite-1", status: "pending", organizationId: "org-1" },
      data: { status: "revoked" },
      include: { organization: true }
    });
    expect(result.status).toBe("revoked");
  });

  test("blocks revoking accepted invitations", async () => {
    prisma.invitation.findFirst.mockResolvedValue({
      id: "invite-2",
      email: "joined@org.com",
      role: "manager",
      status: "accepted",
      organizationId: "org-1",
      organization: { organizationName: "Org One" }
    });

    await expect(
      organizationService.revokeOrganizationInvitation("admin-1", "invite-2")
    ).rejects.toMatchObject({
      message: "Only pending invitations can be revoked.",
      statusCode: 400
    });
  });
});
