const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const { prisma } = require("../config/prisma");

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

const decorateOrganization = (organization) => {
  if (!organization) {
    return null;
  }

  return {
    ...organization,
    _id: organization.id
  };
};

const decorateUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...profile } = user;
  return {
    ...profile,
    _id: user.id,
    organization: decorateOrganization(user.organization)
  };
};

const generateJwt = (user) =>
  jwt.sign({ id: user.id || user._id, email: user.email }, keys.jwtSecret, {
    expiresIn: keys.jwtExpiresIn
  });

const verifyUserCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      organization: true
    }
  });

  if (!user) {
    return null;
  }

  const isMatch = await comparePassword(password, user.password);
  return isMatch ? decorateUser(user) : null;
};

const getUserById = async (id) =>
  decorateUser(
    await prisma.user.findUnique({
      where: { id },
      include: {
        organization: true
      }
    })
  );

const updateOwnProfile = async (userId, { name }) =>
  decorateUser(
    await prisma.user.update({
      where: { id: userId.toString() },
      data: {
        name: name.trim()
      },
      include: {
        organization: true
      }
    })
  );

const registerOrganization = async ({ organizationName, name, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const existingOrganization = await prisma.organization.findUnique({
    where: { organizationName: organizationName.trim() }
  });

  if (existingOrganization) {
    const error = new Error("Organization name is already in use.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        organizationName: organizationName.trim(),
        createdBy: ""
      }
    });

    const createdUser = await tx.user.create({
      data: {
        organizationId: organization.id,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin"
      },
      include: {
        organization: true
      }
    });

    await tx.organization.update({
      where: { id: organization.id },
      data: {
        createdBy: createdUser.id
      }
    });

    return createdUser;
  });

  return decorateUser(user);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateJwt,
  verifyUserCredentials,
  getUserById,
  updateOwnProfile,
  registerOrganization,
  decorateUser
};
