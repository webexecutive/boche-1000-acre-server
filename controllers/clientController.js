const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('../credentials.json');

const submitForm = async (req, res) => {
    try {
        const formData = req.body;
        
        // Setup Auth with write permissions
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet('1kitHHSFSkaF1__QrnR0lrAR8b1ZXL47vt3wHY7WeGUU', serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // Ensure dateRange object is stringified if it exists
        const formattedData = { ...formData };
        if (formattedData.dateRange) {
            formattedData.checkin = formattedData.dateRange.checkin || "";
            formattedData.checkout = formattedData.dateRange.checkout || "";
            delete formattedData.dateRange;
        }

        // Combine Name
        formattedData.Name = `${formattedData.firstName || ''} ${formattedData.secondName || ''}`.trim();
        delete formattedData.firstName;
        delete formattedData.secondName;

        // Combine Address
        const addressParts = [
            formattedData.address1,
            formattedData.address2,
            formattedData.city,
            formattedData.state,
            formattedData.pincode
        ].filter(Boolean); // Remove empty strings or undefined
        
        formattedData.Address = addressParts.join(', ');
        delete formattedData.address1;
        delete formattedData.address2;
        delete formattedData.city;
        delete formattedData.state;
        delete formattedData.pincode;

        // Add row to sheet
        await sheet.addRow(formattedData);

        res.status(200).json({ success: true, message: "Form submitted successfully" });
        
    } catch (error) {
        console.error("Error writing to sheet:", error);
        res.status(500).json({ success: false, message: "Failed to submit form" });
    }
};

module.exports = { submitForm };