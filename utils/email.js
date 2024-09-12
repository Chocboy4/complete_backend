const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail", // or another service like 'SMTP'
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        text: options.message, // Corrected property
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error(`${error} : Error sending Mail`);
        const errorMessage = error.message.includes("ECONNREFUSED")
            ? "There seems to be a problem with the email server connection. Please try again later."
            : error.message.includes("INVALID LOGIN")
                ? "The provided Email Credentials might be incorrect. Please check your .env file."
                : "An error occurred while sending the password reset email";

        throw new Error(errorMessage);
    }
};

module.exports = sendMail;
