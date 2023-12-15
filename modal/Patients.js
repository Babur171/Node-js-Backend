const mongoose = require("mongoose");
const { Schema } = mongoose;

var PatientsSchema = new Schema({
  patient_name: { type: String, require: true },
  image: { type: String, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  admit_date: { type: Date, require: true },
  discharg_date: { type: Date, require: true },
  patient_cnic: { type: Number, require: true },
  patient_case_type:{ type: String, require: true },
  image: { type:  mongoose.SchemaTypes.ObjectId, ref: 'Images' },
  pdffile: { type:  mongoose.SchemaTypes.ObjectId, ref: 'PdfFile' },

});
module.exports = mongoose.model("Patients", PatientsSchema, "patients");