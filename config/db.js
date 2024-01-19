const mongoose = require("mongoose");
const { DATABASE } = require("./constants");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Mongo DB connected :  ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
