const express = require("express");
const { registerUser, loginUser, forgetPassword } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);  // Registration route (POST)
router.post("/login", loginUser);  // Login route (POST)
router.post("/forget-password", forgetPassword); // Fixed route name

module.exports = router;
