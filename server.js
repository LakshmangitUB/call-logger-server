const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS to allow requests from your browser

const PORT = 3000; // Port for the server
const spreadsheetId = "1h4SZCx6zz2YQLUXl3JR8Zweg-PrPaaCS2Cv6irkAxcQ"; // Your Google Spreadsheet ID

// Authenticate Google Sheets API using the provided JSON credentials
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync("./call-logger-app-457216-89bc315989ed.json")), // Path to your JSON credentials file
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.post("/logAnswers", async (req, res) => {
  try {
    const { answers, isNewClient } = req.body;

    // Stop logging if the client is not new
    if (!isNewClient) {
      return res.status(200).send("No log created, as the client is existing.");
    }

    const currentDate = new Date();
    const date = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format
    const time = currentDate.toTimeString().split(" ")[0]; // HH:MM:SS format

    const sheets = google.sheets({ version: "v4", auth });

    // Append answers to Google Sheets with date and time
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1", // Update this if your sheet name is different
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[date, time, ...answers]], // Date and Time are the first two columns
      },
    });

    res.status(200).send("Answers successfully logged into Google Sheets!");
  } catch (error) {
    res.status(500).send("Failed to log answers into Google Sheets: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});