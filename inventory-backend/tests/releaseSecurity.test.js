jest.mock("../src/config/prisma", () => ({ prisma: {} }));

const { decorateUser } = require("../src/services/authService");
const { mapActivityLog, mapNotification } = require("../src/utils/prismaSerializers");

test("authenticated user data excludes the password hash", () => {
  const user = decorateUser({
    id: "user-1",
    name: "Demo",
    password: "stored-hash",
    organization: { id: "org-1", organizationName: "Demo Org" }
  });

  expect(user).toMatchObject({ id: "user-1", _id: "user-1", organization: { _id: "org-1" } });
  expect(user).not.toHaveProperty("password");
});

test("redacts legacy invitation identifiers from shared notifications and activity", () => {
  const details = {
    email: "demo@example.com",
    role: "staff",
    invitationId: "private-invitation",
    inviteLink: "https://example.com/accept-invitation/private-invitation"
  };

  const notification = mapNotification({
    entity: "Invitation",
    entityId: details.invitationId,
    metadata: details
  });
  const activity = mapActivityLog({ entity: "Invitation", details });

  expect(notification.entityId).toBe("");
  expect(notification.metadata).toEqual({ email: details.email, role: details.role });
  expect(activity.details).toEqual({ email: details.email, role: details.role });
});
