const User = require("../models/user_models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    console.log("Received data:", req.body);
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ username, email, password });
    res.status(201).json({ user, message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadProfilePic = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  console.log('Cloud Name:', process.env.CLOUD_NAME);
console.log('API Key:', process.env.CLOUD_API_KEY);
console.log('API Secret:', process.env.CLOUD_API_SECRET);

  try {
    const file = req.files.file;
    console.log("Cloudinary API Key:", process.env.CLOUD_API_SECRET);

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "profile_pics",
    });

    console.log("Cloudinary upload result:", result);

    // Ensure the user is found and updated
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: result.secure_url },
      { new: true } // Return updated document
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ url: result.secure_url, msg: "Upload successful" });
  } catch (error) {
    res.status(500).json({ msg: "Upload failed", error: error.message });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (!user.password) {
    return res.status(500).json({ msg: "User has no password stored" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const tokenUser = {
    username: user.username,
    email: user.email,
    userId: user._id,
  };

  const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ token, message: "Login successful" });
};

module.exports = { registerUser, uploadProfilePic, loginUser };
