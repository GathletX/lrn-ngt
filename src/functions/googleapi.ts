require("dotenv").config();
import { google } from "googleapis";

export const sheets = google.sheets({
  version: "v4",
  auth: process.env.GOOGLE_SHEETS_API_KEY
});
