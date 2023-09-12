require("dotenv").config();

const PORT = process.env.PORT;
const MONOBBFILE = process.env.DATABASE;
const SECRETTOKEN = process.env.SECRETTOKEN;
const REFRESHTOKEN = process.env.REFRESHTOKEN;
const BACKEND_URL_PATH = process.env.BACKEND_URL_PATH;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PROJECT_ID = process.env.PROJECT_ID;
const PRIVATE_KEY_ID = process.env.PRIVATE_KEY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const CLIENT_ID = process.env.CLIENT_ID;

module.exports = {
  PORT,
  MONOBBFILE,
  SECRETTOKEN,
  REFRESHTOKEN,
  BACKEND_URL_PATH,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SESSION_SECRET,
  CLIENT_ID,
  CLIENT_EMAIL,
  PRIVATE_KEY,
  PRIVATE_KEY_ID,
  PROJECT_ID,
};
