const passport = require("passport");
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const auditLogService = require("../services/auditLogService");
const notificationService = require("../services/notificationService");
const organizationService = require("../services/organizationService");
const { disconnectSessionSockets } = require("../config/socket");

const tokenCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000
});

const buildSessionUserPayload = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organizationId: user.organizationId,
  organizationName: user.organization?.organizationName || ""
});

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.registerOrganization(req.body);
  await auditLogService.logActivity({
    userId: user.id,
    organizationId: user.organizationId,
    action: "user.registered",
    entity: "User",
    details: {
      name: user.name,
      email: user.email,
      role: user.role,
      organizationName: user.organization?.organizationName || ""
    }
  });

  req.flash("success_msg", "Organization created successfully. Please log in.");
  return res.redirect("/login");
});

exports.login = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      req.flash("error_msg", info.message);
      return res.redirect("/login");
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      const token = authService.generateJwt(user);
      res.cookie("token", token, tokenCookieOptions());
      auditLogService.logActivity({
        userId: user.id,
        organizationId: user.organizationId,
        action: "user.logged_in",
        entity: "Auth",
        details: {
          email: user.email,
          role: user.role,
          organizationName: user.organization?.organizationName || ""
        }
      }).catch(() => {});
      req.flash("success_msg", "Login successful.");
      return res.redirect("/dashboard");
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  const activeUser = req.user;
  const sessionId = req.sessionID;
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      disconnectSessionSockets(sessionId);
      res.clearCookie("connect.sid");
      res.clearCookie("token");
      if (activeUser) {
        auditLogService.logActivity({
          userId: activeUser.id || activeUser._id,
          organizationId: activeUser.organizationId,
          action: "user.logged_out",
          entity: "Auth",
          details: {
            email: activeUser.email,
            role: activeUser.role
          }
        }).catch(() => {});
      }
      return res.redirect("/login");
    });
  });
};

exports.issueJwt = asyncHandler(async (req, res) => {
  const user = req.user || req.apiUser;
  const token = authService.generateJwt(user);

  res.json({
    message: "JWT generated successfully.",
    token
  });
});

exports.apiRegister = asyncHandler(async (req, res, next) => {
  const createdUser = await authService.registerOrganization(req.body);
  await auditLogService.logActivity({
    userId: createdUser.id,
    organizationId: createdUser.organizationId,
    action: "user.registered",
    entity: "User",
    details: {
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      organizationName: createdUser.organization?.organizationName || ""
    }
  });

  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      const token = authService.generateJwt(user);
      res.cookie("token", token, tokenCookieOptions());

      return res.status(201).json({
        message: "Registration successful.",
        user: buildSessionUserPayload(user)
      });
    });
  })(req, res, next);
});

exports.apiLogin = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      const token = authService.generateJwt(user);
      res.cookie("token", token, tokenCookieOptions());
      auditLogService.logActivity({
        userId: user.id || user._id,
        organizationId: user.organizationId,
        action: "user.logged_in",
        entity: "Auth",
        details: {
          email: user.email,
          role: user.role,
          organizationName: user.organization?.organizationName || ""
        }
      }).catch(() => {});

      return res.json({
        message: "Login successful.",
        user: buildSessionUserPayload(user)
      });
    });
  })(req, res, next);
};

exports.apiLogout = (req, res, next) => {
  const activeUser = req.user;
  const sessionId = req.sessionID;
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      disconnectSessionSockets(sessionId);
      res.clearCookie("connect.sid");
      res.clearCookie("token");
      if (activeUser) {
        auditLogService.logActivity({
          userId: activeUser.id || activeUser._id,
          organizationId: activeUser.organizationId,
          action: "user.logged_out",
          entity: "Auth",
          details: {
            email: activeUser.email,
            role: activeUser.role
          }
        }).catch(() => {});
      }
      return res.json({ message: "Logout successful." });
    });
  });
};

exports.apiSessionProfile = asyncHandler(async (req, res) => {
  res.json({
    user: buildSessionUserPayload(req.user)
  });
});

exports.apiUpdateSessionProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateOwnProfile(req.user.id || req.user._id, {
    name: req.body.name
  });

  await auditLogService.logActivity({
    userId: updatedUser.id,
    organizationId: updatedUser.organizationId,
    action: "user.updated_profile",
    entity: "User",
    details: {
      name: updatedUser.name,
      email: updatedUser.email
    }
  });

  res.json({
    message: "Profile updated successfully.",
    user: buildSessionUserPayload(updatedUser)
  });
});

exports.apiAcceptInvitation = asyncHandler(async (req, res, next) => {
  const invitedUser = await organizationService.acceptInvitation(req.body);
  await auditLogService.logActivity({
    organizationId: invitedUser.organizationId,
    userId: invitedUser.id,
    action: "organization.accepted_invitation",
    entity: "Invitation",
    details: {
      email: invitedUser.email,
      role: invitedUser.role,
      organizationName: invitedUser.organization?.organizationName || ""
    }
  });
  await notificationService.createNotification({
    organizationId: invitedUser.organizationId,
    actorUserId: invitedUser.id,
    type: "organization.invitation.accepted",
    title: "New team member joined",
    message: `${invitedUser.name} joined the organization as ${invitedUser.role}.`,
    entity: "Invitation",
    metadata: {
      email: invitedUser.email,
      role: invitedUser.role,
      organizationName: invitedUser.organization?.organizationName || ""
    }
  });

  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      const token = authService.generateJwt(user);
      res.cookie("token", token, tokenCookieOptions());

      return res.status(201).json({
        message: "Invitation accepted successfully.",
        user: buildSessionUserPayload(user)
      });
    });
  })(req, res, next);
});
