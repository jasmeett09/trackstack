const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const authService = require("../services/authService");

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies.token;
};

const ensureJwtAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "JWT token is required." });
    }

    const decoded = jwt.verify(token, keys.jwtSecret);
    const user = await authService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token user." });
    }

    req.apiUser = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = {
  ensureJwtAuth
};
