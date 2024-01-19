const mongoose = require("mongoose");
const { Schema } = mongoose;

var LabReportsSchema = new Schema({
  description: { type: String,default: null},
  doctorTestDescription: { type: String,default: null},
  dateTime: { type: Date,default: null },
  doctor: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  patient: { type: mongoose.SchemaTypes.ObjectId, ref: "Patients" },
  labReportImage:  { type:  String, require: true},
  labReportPdf:  { type:  String, require: true},
  reportUpload:{type: Boolean, default: false}
},{
  timestamps: true
});
module.exports = mongoose.model("LabReports", LabReportsSchema, "LabReports");
