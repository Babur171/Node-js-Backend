const mongoose = require("mongoose");
const { Schema } = mongoose;

const pdfFileSchema = new Schema({
  filename: { type: String, require: true },
  contentType: { type: String, require: true },
  metadata: { collection: String },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PdfFile', pdfFileSchema, "pdfFile");
