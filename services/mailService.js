const nodemailer = require("nodemailer");

const sendConfirmationMail = async (toEmail, name) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Boche 1000 Acres" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Enquiry Received",
        html: `<h3>Hello ${name}, we received your enquiry.</h3>`,
    });
};

module.exports = sendConfirmationMail;