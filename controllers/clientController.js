const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');
const { Mutex } = require('async-mutex');
const {
    sendEnquiryConfirmationToClient,
    sendEnquiryDetailsToAdmin,
    sendContactMailToAdmin,
} = require("../services/mailService");

const enqMutex = new Mutex();

const getAuth = () => {
    const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
    );
    return new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
};

const submitForm = async (req, res) => {
    try {
        const formData = req.body;

        const serviceAccountAuth = getAuth();
        const sheetsApi = google.sheets({ version: 'v4', auth: serviceAccountAuth });

        const formatDate = (dateStr) => {
            if (!dateStr) return "";
            const parts = dateStr.split("-");
            if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            return dateStr;
        };

        const formattedData = { ...formData };

        if (formattedData.dateRange) {
            formattedData.checkin = formatDate(formattedData.dateRange.checkin);
            formattedData.checkout = formatDate(formattedData.dateRange.checkout);
            delete formattedData.dateRange;
        }

        const name = `${formattedData.firstName || ''} ${formattedData.secondName || ''}`.trim();

        const address = [
            formattedData.address1,
            formattedData.address2,
            formattedData.city,
            formattedData.state,
            formattedData.pincode
        ].filter(Boolean).join(', ');

        const finalData = {
            Name: name,
            Address: address,
            Email: formattedData.email || "",
            Phone: formattedData.phone || "",
            Adults: Number(formattedData.adults) || 0,
            Children: Number(formattedData.children) || 0,
            Checkin: formattedData.checkin || "",
            Checkout: formattedData.checkout || "",
        };

        // ── Generate unique Enq No with mutex lock ──
        const release = await enqMutex.acquire();
        let nextEnqNo;

        try {
            const counterRes = await sheetsApi.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: "Enquiry!K1",
            });

            const lastNumber = parseInt(counterRes.data.values?.[0]?.[0] || '0', 10);
            const nextNumber = lastNumber + 1;
            nextEnqNo = `ENQ-${String(nextNumber).padStart(6, '0')}`;

            await sheetsApi.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: "Enquiry!K1",
                valueInputOption: 'RAW',
                requestBody: { values: [[nextNumber]] }
            });

        } finally {
            release();
        }

        // ── Insert blank row at position 2 ──
        await sheetsApi.spreadsheets.batchUpdate({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            requestBody: {
                requests: [{
                    insertDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: 1,
                            endIndex: 2,
                        },
                        inheritFromBefore: false,
                    }
                }]
            }
        });

        // ── Write data into row 2 ──
        await sheetsApi.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "Enquiry!A2:J2",
            valueInputOption: 'RAW',
            requestBody: {
                values: [[
                    nextEnqNo,
                    finalData.Name,
                    finalData.Address,
                    finalData.Email,
                    finalData.Phone,
                    finalData.Adults,
                    finalData.Children,
                    finalData.Checkin,
                    finalData.Checkout,
                    'New',
                ]]
            }
        });

        try {
    // Read all current data from main sheet
    const mainData = await sheetsApi.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Enquiry!A1:J",
    });

    // Write all data to backup sheet
    await sheetsApi.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_BACKUP_SHEET_ID,
        range: "Sheet1!A1",
        valueInputOption: 'RAW',
        requestBody: {
            values: mainData.data.values || [],
        }
    });

    console.log("✅ Backup updated successfully");
} catch (backupErr) {
    // Backup failure should NOT affect main form submission
    console.error("❌ Backup error:", backupErr.message);
}

        // ── Reset unprotected range back to full column J from row 2 ──
        await sheetsApi.spreadsheets.batchUpdate({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            requestBody: {
                requests: [{
                    updateProtectedRange: {
                        protectedRange: {
                            protectedRangeId: 164142777,
                            range: {},
                            unprotectedRanges: [{
                                startRowIndex: 1,     // row 2 (0-indexed)
                                startColumnIndex: 9,  // column J (0-indexed)
                                endColumnIndex: 10,
                                // No endRowIndex = to end of sheet
                            }],
                            editors: {
                                users: [
                                    "sheets-access@boche-1000-acre.iam.gserviceaccount.com",
                                    "boche.bhumiputra@gmail.com"
                                ]
                            }
                        },
                        fields: 'unprotectedRanges',
                    }
                }]
            }
        });

        // ── Send emails ──
        if (finalData.Email) {
            await sendEnquiryConfirmationToClient(finalData.Email, finalData.Name);
        }
        await sendEnquiryDetailsToAdmin({ ...finalData, EnqNo: nextEnqNo });

        res.status(200).json({
            success: true,
            message: "Form submitted successfully",
        });

    } catch (error) {
        console.error("❌ submitForm error:", error);
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

        await sendContactMailToAdmin({ email, subject, message });

        res.status(200).json({
            success: true,
            message: "Message sent successfully.",
        });

    } catch (error) {
        console.error("❌ submitContactForm error:", error);
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

        const serviceAccountAuth = getAuth();
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[1];

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
        console.error("❌ submitSubscriber error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to subscribe.",
            error: error.message,
        });
    }
};

module.exports = { submitForm, submitContactForm, submitSubscriber };