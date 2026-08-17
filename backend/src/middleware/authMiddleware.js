import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware that verifies a JWT from the Authorization header.
 * Attaches the authenticated user document to req.user.
 * Use on any route that requires authentication.
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
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token is invalid or expired." });
  }
};

export { protect };
