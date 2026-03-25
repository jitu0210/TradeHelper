import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username || email)) {
      return res.status(400).json({ error: "Username or Email is required" });
    }

    const existedUser = await User.findOne({
      $or: [{ username, email }],
    });

    if (existedUser) {
      return res
        .status(400)
        .json({ error: "User with same email or username already exist" });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshtoken -_id"
    );

    if (!createdUser) {
      return res.status(400).json({ error: "Error while creating user" });
    }

    return res.status(200).json(createdUser, "User registered successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Invalid Password." });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshtoken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
      },
      accessToken,     
      refreshToken,    
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error); 
    return res.status(500).json({ error: "Internal server error" });
  }
};



const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  // NOTE: You should verify the refresh token against the database (user.refreshToken) for security

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(decoded.userId);
    return res.status(200).json({ accessToken });
  });
};

export { 
  registerUser, 
  loginUser,
  logoutUser, 
  refreshToken 
};