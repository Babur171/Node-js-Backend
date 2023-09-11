const mongoose = require("mongoose");
const { Schema } = mongoose;

var DevicesSchema = new Schema({
  device_name: { type: String, require: true },
  device_token: { type: String, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});
module.exports = mongoose.model("Devices", DevicesSchema, "devices");
