const mongoose = require("mongoose");
const { Schema } = mongoose;

var PreviousLocationSchema = new Schema({
  address: { type: String, require: true },
  latitude: { type: String, require: true },
  longitude: { type: String, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});

module.exports = mongoose.model(
  "PreviousLocation",
  PreviousLocationSchema,
  "previousLocation"
);
