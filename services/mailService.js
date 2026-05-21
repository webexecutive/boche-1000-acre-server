const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.rediffmailpro.com",
    port: 587,
    secure: false,
    name: "bochehg.com",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "loaded" : "MISSING");

// ── 1. Confirmation to client — "We received your enquiry" ──
const sendEnquiryConfirmationToClient = async (to, name) => {
    console.log("📧 Sending enquiry confirmation to client:", to);
    try {
        await transporter.sendMail({
            from: `"Boche 1000 acre" <${process.env.EMAIL_USER}>`,
            to,
            subject: "We've Received Your Enquiry",
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for reaching out to <strong>Boche 1000 Acre</strong>.</p>
                <p>We have received your booking enquiry and our team will get back to you shortly.</p>
                <br/>
                <p>Warm regards,<br/>Boche 1000 Acre Team</p>
            `,
        });
        console.log("✅ Confirmation sent to client:", to);
    } catch (err) {
        console.error("❌ Client confirmation error:", err.message);
        throw err;
    }
};

// ── 2. Enquiry details to admin ──
const sendEnquiryDetailsToAdmin = async (enquiryData) => {
    console.log("📧 Sending enquiry details to admin");
    try {
        await transporter.sendMail({
            from: `"New Enquiry" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Booking — ${enquiryData.Name} | ${enquiryData.Checkin} to ${enquiryData.Checkout}`,
            html: `
                <h2>New Booking Enquiry</h2>
                <p><strong>Name:</strong> ${enquiryData.Name}</p>
                <p><strong>Email:</strong> ${enquiryData.Email}</p>
                <p><strong>Phone:</strong> ${enquiryData.Phone}</p>
                <p><strong>Adults:</strong> ${enquiryData.Adults}</p>
                <p><strong>Children:</strong> ${enquiryData.Children}</p>
                <p><strong>Checkin:</strong> ${enquiryData.Checkin}</p>
                <p><strong>Checkout:</strong> ${enquiryData.Checkout}</p>
                <p><strong>Address:</strong> ${enquiryData.Address}</p>
                <hr/>
                <p style="font-size:12px;color:#999;">Received via Chulika Estate booking form</p>
            `,
        });
        console.log("✅ Enquiry details sent to admin");
    } catch (err) {
        console.error("❌ Admin enquiry mail error:", err.message);
        throw err;
    }
};

// ── 3. Contact form message to admin ──
const sendContactMailToAdmin = async ({ email, subject, message }) => {
    console.log("📧 Sending contact form mail to admin from:", email);
    try {
        const senderName = email.split("@")[0];

        await transporter.sendMail({
            from: `"${senderName}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `[Contact Form] ${subject}`,
            html: `
                <h2>New Message from Website</h2>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background:#f9f9f9;padding:16px;border-radius:8px;color:#444;">
                    ${message.replace(/\n/g, "<br/>")}
                </div>
                <hr/>
                <p style="font-size:12px;color:#999;">Sent via Chulika Estate contact form</p>
            `,
        });
        console.log("✅ Contact mail sent to admin");
    } catch (err) {
        console.error("❌ Contact mail error:", err.message);
        throw err;
    }
};

module.exports = {
    sendEnquiryConfirmationToClient,
    sendEnquiryDetailsToAdmin,
    sendContactMailToAdmin,
};