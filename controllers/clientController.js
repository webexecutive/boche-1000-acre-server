const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const sendConfirmationMail = require("../services/mailService");

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

        const doc = new GoogleSpreadsheet(
            '1kitHHSFSkaF1__QrnR0lrAR8b1ZXL47vt3wHY7WeGUU',
            serviceAccountAuth
        );

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

        // 📧 Send confirmation email
        if (finalData.Email) {
            await sendConfirmationMail(finalData.Email, finalData.Name);
        }
        await sendConfirmationMail(
            process.env.EMAIL_USER,
            "Admin",
            finalData
        );

        res.status(200).json({
            success: true,
            message: "Form submitted successfully",
        });

    } catch (error) {
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Full error:", error);
    res.status(500).json({
        success: false,
        message: "Failed to submit form",
        error: error.message
    });
}
};

module.exports = { submitForm };