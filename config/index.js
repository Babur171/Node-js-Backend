require("dotenv").config();

const PORT = process.env.PORT;
const MONOBBFILE = process.env.DATABASE;
const SECRETTOKEN = process.env.SECRETTOKEN;
const REFRESHTOKEN = process.env.REFRESHTOKEN;
const BACKEND_URL_PATH = process.env.BACKEND_URL_PATH;

module.exports = {
  PORT,
  MONOBBFILE,
  SECRETTOKEN,
  REFRESHTOKEN,
  BACKEND_URL_PATH,
};
