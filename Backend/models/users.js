// Backend/models/users.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName : { type: String },
    email: { type: String, required: true, unique: true }, // Email must be unique and required
    password: { type: String, required: true }, // Password must be required
    phoneNumber: { type: Number },
    imageUrl: { type: String },
}, { timestamps: true }); // Add timestamps for creation and update times

const User = mongoose.model("users", UserSchema);
module.exports = User;
