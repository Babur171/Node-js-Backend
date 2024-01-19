const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const S3 = require("../config/s3Bucket")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const handleFileUpload = async (file, destination) => {
  try {
    const uploadParams = {
      Bucket: "hospital-s3-bucket0198",
      Key: `${destination + uuidv4() + "." + file?.mimetype.split("/")[1]}`,
      Body: file.buffer,
    };

    const s3UploadResult = await S3.upload(uploadParams).promise();
    return s3UploadResult.Location;
  } catch (error) {
    throw error;
  }
};

module.exports = { upload, handleFileUpload };