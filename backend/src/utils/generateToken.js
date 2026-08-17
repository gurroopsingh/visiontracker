import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT token for the given user id.
 * @param {string} id - MongoDB ObjectId of the user
 * @returns {string} signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
