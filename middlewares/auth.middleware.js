import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ error: "User not found." });
      }

      req.user = user; 
      return next();
    } catch (error) {
      console.error("Token error:", error);
      return res.status(401).json({ error: "Not authorized, token invalid or expired" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, token missing" });
  }
};

export default protect;