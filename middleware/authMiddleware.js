import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access Denied" });

  try {
    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    if (!token) return res.status(401).json({ message: "Token missing" }); // Extra check if token exists

    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = verified; // Attach user info to req object
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
