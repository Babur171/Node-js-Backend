const mongoose = require("mongoose");
const { Schema } = mongoose;

var CurrentLocationSchema = new Schema({
  address: { type: String, require: true },
  latitude: { type: String, require: true },
  longitude: { type: String, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});

module.exports = mongoose.model(
  "CurrentLocation",
  CurrentLocationSchema,
  "currentLocation"
);
