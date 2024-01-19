const mongoose = require("mongoose");
const { Schema } = mongoose;

var XrayReportsSchema = new Schema({
  description: { type: String, require: true },
  dateTime: { type: Date, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  patient: { type: mongoose.SchemaTypes.ObjectId, ref: "Patients" },
  xrayReportImage:  { type:  String, require: true},
  xrayReportPdf:  { type:  String, require: true},

});
module.exports = mongoose.model("XrayReportsSchema", XrayReportsSchema, "XrayReports");