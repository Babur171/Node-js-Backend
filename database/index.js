const mongoose = require("mongoose");
const { MONOBBFILE } = require("../config/index");
const dataBase = async () => {
  try {
    await mongoose.connect(MONOBBFILE);
  } catch (err) {
    console.log("error", err);
  }
};

module.exports = dataBase;
