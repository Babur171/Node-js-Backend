const AWS = require("aws-sdk");
const { S3_ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION } = require("./constants");

AWS.config.update({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
  });

const S3 = new AWS.S3({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION, 
  });

module.exports = S3;
