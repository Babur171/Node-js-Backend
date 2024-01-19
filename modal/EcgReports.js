const mongoose = require("mongoose");
const { Schema } = mongoose;

var EcgReportsSchema = new Schema({
  description: { type: String, require: true },
  dateTime: { type: Date, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  patient: { type: mongoose.SchemaTypes.ObjectId, ref: "Patients" },
  ecg_report_image:  { type:  String, require: true},
  ecg_report_pdf:  { type:  String, require: true},

});
module.exports = mongoose.model("EcgReports", EcgReportsSchema, "RcgReports");