// Backend/controller/authController.js
const User = require("../models/users");
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For creating JWT tokens

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};

// Register a new user
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, imageUrl } = req.body;

  // Basic validation
  if (!email || !password || !firstName) {
    return res.status(400).json({ message: "Please enter all required fields (firstName, email, password)." });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store hashed password
      phoneNumber,
      imageUrl,
    });

    const savedUser = await newUser.save();

    // Respond with user data and a token
    res.status(201).json({
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      token: generateToken(savedUser._id), // Generate and send JWT token
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password." });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password); // Compare provided password with hashed password
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Respond with user data and a token
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id), // Generate and send JWT token
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
