require("dotenv").config();

const PORT = process.env.PORT;
const MONOBBFILE = process.env.DATABASE;
const SECRETTOKEN = process.env.SECRETTOKEN;
const REFRESHTOKEN = process.env.REFRESHTOKEN;
const BACKEND_URL_PATH = process.env.BACKEND_URL_PATH;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

module.exports = {
  PORT,
  MONOBBFILE,
  SECRETTOKEN,
  REFRESHTOKEN,
  BACKEND_URL_PATH,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SESSION_SECRET,
};
