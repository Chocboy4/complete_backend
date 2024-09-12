const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const registerUser = async (request, response) => {
    const { firstName, lastName, email, password } = request.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return response.status(400).json({ error: "User with this email already exists. Please use a different email." });
        }

        // Create new user
        const user = await User.create({ firstName, lastName, email, password });

        if (user) {
            const token = generateToken(user._id);

            response.cookie("jwt", token, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie valid for 30 days
            });

            return response.status(201).json({
                message: "User registered successfully",
                user,
                token,
            });
        } else {
            return response.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Server error, please try again later" });
    }
};


// Login User Function
const loginUser = async (request, response) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(400).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        response.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return response.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Server error, please try again later" });
    }
};

const forgetPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `${request.protocol}://${request.get("host")}/api/users/reset-password/${resetToken}`;
        const message = `You are receiving this email because you or someone else has requested a password reset. Please click the following link to reset your password: \n\n ${resetUrl}`;

        await sendEmail({
            email: user.email,
            subject: "Password reset Token",
            message: message,
        });

        return response.status(200).json({ success: true, message: "Reset link sent to email" });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Server error, please try again later" });
    }
};

module.exports = { registerUser, loginUser, forgetPassword };
