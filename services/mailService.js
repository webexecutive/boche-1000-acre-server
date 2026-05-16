const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendConfirmationMail = async (to, name, enquiryData = null) => {

    let subject = "Booking Confirmation";
    let html = `
        <h2>Hello ${name},</h2>
        <p>Your enquiry has been received successfully.</p>
    `;

    // If enquiryData exists → admin notification
    if (enquiryData) {
        subject = "New Booking Enquiry Received";

        html = `
            <h2>New Enquiry Received</h2>

            <p><strong>Name:</strong> ${enquiryData.Name}</p>
            <p><strong>Email:</strong> ${enquiryData.Email}</p>
            <p><strong>Phone:</strong> ${enquiryData.Phone}</p>
            <p><strong>Adults:</strong> ${enquiryData.Adults}</p>
            <p><strong>Children:</strong> ${enquiryData.Children}</p>
            <p><strong>Checkin:</strong> ${enquiryData.Checkin}</p>
            <p><strong>Checkout:</strong> ${enquiryData.Checkout}</p>
            <p><strong>Address:</strong> ${enquiryData.Address}</p>
        `;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};

module.exports = sendConfirmationMail;