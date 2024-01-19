const mongoose = require("mongoose");
const { Schema } = mongoose;

var ImageSchema = new Schema({
  filename: { type: String, require: true },
  contentType: { type: String, require: true },
  metadata: { collection: String },
  uploadDate: { type: Date, default: Date.now },

});

module.exports = mongoose.model("Images", ImageSchema, "images");
