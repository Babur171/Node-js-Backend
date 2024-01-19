require("dotenv").config();

const PORT = process.env.PORT;
const DATABASE = process.env.DATABASE;
const SECRETTOKEN = process.env.SECRETTOKEN;
const REFRESHTOKEN = process.env.REFRESHTOKEN;
const BACKEND_URL_PATH = 'http://ec2-100-27-21-230.compute-1.amazonaws.com';
const SESSION_SECRET = process.env.SESSION_SECRET;
const SENDGRID_KEY = process.env.SENDGRID_KEY;
const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const REGION = process.env.REGION;


module.exports = {
  PORT,
  DATABASE,
  SECRETTOKEN,
  REFRESHTOKEN,
  BACKEND_URL_PATH,
  SESSION_SECRET,
  SENDGRID_KEY,
  SENDER_EMAIL_ADDRESS,
  S3_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  REGION
};
