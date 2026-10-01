import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

/**
 * Middleware that verifies a JWT from the Authorization header.
 * Attaches the authenticated user document to req.user.
 * Use on any route that requires authentication.
 *
 * Logs all authentication failures with enough context for auditing
 * without exposing sensitive data (no token values in logs).
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    logger.warn("Auth failed: no token provided", {
      event: "auth_no_token",
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      logger.warn("Auth failed: user no longer exists", {
        event: "auth_user_not_found",
        userId: decoded.id,
        path: req.path,
      });
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    next();
  } catch (error) {
    logger.warn(`Auth failed: ${error.name}`, {
      event: "auth_token_invalid",
      errorName: error.name,
      path: req.path,
      ip: req.ip,
    });
    return res
      .status(401)
      .json({ success: false, message: "Token is invalid or expired." });
  }
};

export { protect };
