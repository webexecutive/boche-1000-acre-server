const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const {
    sendEnquiryConfirmationToClient,
    sendEnquiryDetailsToAdmin,
    sendContactMailToAdmin,
} = require("../services/mailService");

const submitForm = async (req, res) => {
    try {
        const formData = req.body;

        const credentials = JSON.parse(
            Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
        );

        const serviceAccountAuth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadHeaderRow();

        const formatDate = (dateStr) => {
            if (!dateStr) return "";
            const parts = dateStr.split("-");
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateStr;
        };

        const formattedData = { ...formData };

        if (formattedData.dateRange) {
            formattedData.checkin = formatDate(formattedData.dateRange.checkin);
            formattedData.checkout = formatDate(formattedData.dateRange.checkout);
            delete formattedData.dateRange;
        }

        formattedData.Name = `${formattedData.firstName || ''} ${formattedData.secondName || ''}`.trim();
        delete formattedData.firstName;
        delete formattedData.secondName;

        const addressParts = [
            formattedData.address1,
            formattedData.address2,
            formattedData.city,
            formattedData.state,
            formattedData.pincode
        ].filter(Boolean);

        formattedData.Address = addressParts.join(', ');
        delete formattedData.address1;
        delete formattedData.address2;
        delete formattedData.city;
        delete formattedData.state;
        delete formattedData.pincode;

        const finalData = {
            Name: formattedData.Name || "",
            Address: formattedData.Address || "",
            Email: formattedData.email || "",
            Phone: formattedData.phone || "",
            Adults: Number(formattedData.adults) || 0,
            Children: Number(formattedData.children) || 0,
            Checkin: formattedData.checkin || "",
            Checkout: formattedData.checkout || "",
        };

        await sheet.addRow(finalData);

        // 📧 Send confirmation to client
        if (finalData.Email) {
            await sendEnquiryConfirmationToClient(finalData.Email, finalData.Name);
        }

        // 📧 Send enquiry details to admin
        await sendEnquiryDetailsToAdmin(finalData);

        res.status(200).json({
            success: true,
            message: "Form submitted successfully",
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit form",
            error: error.message,
        });
    }
};

const submitContactForm = async (req, res) => {
    try {
        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Email, subject and message are required.",
            });
        }

        // 📧 Send contact message to admin
        await sendContactMailToAdmin({ email, subject, message });

        res.status(200).json({
            success: true,
            message: "Message sent successfully.",
        });

    } catch (error) {
        console.error("❌ Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message.",
            error: error.message,
        });
    }
};

const submitSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const credentials = JSON.parse(
            Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
        );

        const serviceAccountAuth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[1];

        // Check if email already exists
        const rows = await sheet.getRows();
        const alreadyExists = rows.some(row => row.get("Email") === email);

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "This email is already subscribed.",
            });
        }

        await sheet.addRow({ Email: email });

        res.status(200).json({
            success: true,
            message: "Subscribed successfully.",
        });

    } catch (error) {
        console.error("Subscriber error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to subscribe.",
            error: error.message,
        });
    }
};

module.exports = { submitForm, submitContactForm, submitSubscriber };