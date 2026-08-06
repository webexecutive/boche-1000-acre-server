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


// ── 1. Confirmation to client — "We received your enquiry" ──
const sendEnquiryConfirmationToClient = async (to, name) => {
    console.log("📧 Sending enquiry confirmation to client:", to);
    try {
        await transporter.sendMail({
            from: `"Boche 1000 acre" <${process.env.EMAIL_USER}>`,
            to,
            subject: "We've Received Your Enquiry",
            html: `
    <div style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">

        <!-- Logo -->
        <div style="text-align:center;padding:32px 0 16px;">
            <img src="https://boche1000acre.com/logos/mail.webp" alt="Boche 1000 Acre" width="300px" />
        </div>

        <!-- Header Banner -->
        <div style="background:#3a5a1c;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Enquiry Received!</h1>
        </div>

        <!-- Body -->
        <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;">

            <h2 style="margin-top:0;">Hello ${name},</h2>
            <p>Thank you for reaching out to <strong>Boche 1000 Acre</strong>.</p>
            <p>We have received your booking enquiry and our team will get back to you within <strong>24 hours</strong>.</p>

            <!-- Info Box -->
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin:24px 0;">
                <h3 style="margin-top:0;color:#3a5a1c;">What happens next?</h3>
                <p style="margin:8px 0;">📞 Our team will call to confirm availability.</p>
                <p style="margin:8px 0;">📋 We will share the detailed itinerary and pricing.</p>
                <p style="margin:8px 0;">✅ Once confirmed, we will send your booking confirmation.</p>
            </div>

            <!-- Contact Info -->
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin:24px 0;">
                <h3 style="margin-top:0;color:#3a5a1c;">Need immediate assistance?</h3>
                <p style="margin:8px 0;">📞 <strong>Reception:</strong> +91 70340 48884</p>
                <p style="margin:8px 0;">📞 <strong>Reception:</strong> +91 80860 04747</p>
                <p style="margin:8px 0;">📧 <strong>Email:</strong> booking@bochehg.com</p>
                <p style="margin:8px 0;">📍 <strong>Address:</strong> boCHE 1000 Acre, boCHE Junction, Meppadi, Wayanad, Kerala 673577</p>
            </div>

            <p>Warm regards,<br/><strong>Boche 1000 Acre Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:16px;font-size:12px;color:#999;">
            <p>© 2025 Boche 1000 Acre. All rights reserved.</p>
            <p>boCHE 1000 Acre, boCHE Junction, Meppadi, Wayanad, Kerala 673577</p>
        </div>

    </div>
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
    <div style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">

        <!-- Header -->
        <div style="background:#3a5a1c;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">New Booking Enquiry</h1>
        </div>

        <!-- Body -->
        <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;">

            <!-- Guest Details -->
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin-bottom:16px;">
                <h3 style="margin-top:0;color:#3a5a1c;">Guest Details</h3>
                <p style="margin:8px 0;"><strong>Name:</strong> ${enquiryData.Name}</p>
                <p style="margin:8px 0;"><strong>Email:</strong> ${enquiryData.Email}</p>
                <p style="margin:8px 0;"><strong>Phone:</strong> ${enquiryData.Phone}</p>
                <p style="margin:8px 0;"><strong>Address:</strong> ${enquiryData.Address}</p>
            </div>

            <!-- Booking Details -->
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:20px;">
                <h3 style="margin-top:0;color:#3a5a1c;">Booking Details</h3>
                <p style="margin:8px 0;"><strong>Adults:</strong> ${enquiryData.Adults}</p>
                <p style="margin:8px 0;"><strong>Children:</strong> ${enquiryData.Children}</p>
                <p style="margin:8px 0;"><strong>Check-in:</strong> ${enquiryData.Checkin}</p>
                <p style="margin:8px 0;"><strong>Check-out:</strong> ${enquiryData.Checkout}</p>
            </div>

        </div>

    </div>
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
                <p style="font-size:12px;color:#999;">Sent via boCHE 1000 Acre contact form</p>
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