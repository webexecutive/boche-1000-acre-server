const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

async function testWriteData() {
    try {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY 
            ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : "";

        // 1. Setup Auth with write permissions
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet('1kitHHSFSkaF1__QrnR0lrAR8b1ZXL47vt3wHY7WeGUU', serviceAccountAuth);

        console.log("Connecting...");
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // 2. Define the data you want to add
        // IMPORTANT: These keys must match your Sheet headers exactly!
        const testData = {
            Name: "Test User",
            Email: "test@example.com",
            Message: "This is a test entry added at " + new Date().toLocaleTimeString()
        };

        console.log("Adding row to sheet...");
        await sheet.addRow(testData);

        console.log("✅ Success! Check your Google Sheet now.");
        
    } catch (error) {
        console.error("❌ Write Test Failed!");
        if (error.message.includes('403')) {
            console.error("Permission Denied: Make sure the Service Account email is an 'Editor' on the Sheet.");
        } else {
            console.error(error);
        }
    }
}

testWriteData();