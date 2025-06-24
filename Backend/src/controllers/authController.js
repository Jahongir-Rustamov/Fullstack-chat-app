import { generateToken } from "../library/utils.js";
import User from "../models/user.model.js";
import imagekit from "../library/imageKit.js";
import bcrypt from "bcryptjs";

export const SignupSection = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      return res
        .status(400)
        .json({ message: "Full name must contain only letters and spaces" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const gensalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, gensalt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    if (savedUser) {
      generateToken(savedUser._id, res);
      return res.status(201).json({ message: "User created successfully" });
    } else {
      return res.status(500).json({ message: "User creation failed" });
    }
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const LoginSection = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.log("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const LogoutSection = async (req, res) => {
  try {
    res.clearCookie("jwt_token");
    res.status(200).json({ message: "Logout successful 🎉" });
  } catch (error) {
    console.log("Error during logout:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const { ProfilePic } = req.body;
    if (!ProfilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const userId = req.user._id;
    const ReplacedImage = ProfilePic.replace(/^data:image\/[a-z]+;base64,/, "");
    const imageBuffer = Buffer.from(ReplacedImage, "base64");
    const imageUploadResponse = await imagekit.upload({
      file: imageBuffer,
      fileName: `profile-${userId}-${Date.now()}.jpg`,
      folder: "Chat_Images",
    });
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUploadResponse.url },
      { new: true }
    );

    res.status(200).json(updateUser);
  } catch (error) {
    console.log(
      "Error during profile update:",
      error,
      error?.message,
      error?.response?.data
    );
    res
      .status(500)
      .json({ message: "Internal server error", error: error?.message });
  }
};

export const CheckUserAuth = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    console.log("User:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error checking user authentication:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
