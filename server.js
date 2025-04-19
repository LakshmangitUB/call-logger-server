const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;
const spreadsheetId = "1h4SZCx6zz2YQLUXl3JR8Zweg-PrPaaCS2Cv6irkAxcQ"; // Replace with your sheet ID

app.use(bodyParser.json());
app.use(cors());

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync("./call-logger-app-457216-89bc315989ed.json")),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.post("/logAnswers", async (req, res) => {
  try {
    const { answers, isNewClient } = req.body;
    if (!isNewClient) return res.status(200).send("No log created (existing client).");

    const currentDate = new Date();
    const date = currentDate.toISOString().split("T")[0];
    const time = currentDate.toTimeString().split(" ")[0];

    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1", // adjust if your tab is named differently
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[date, time, ...answers]]
      }
    });

    res.status(200).send("Answers logged to Google Sheets!");
  } catch (error) {
    console.error("Logging error:", error.message);
    res.status(500).send("Error: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
