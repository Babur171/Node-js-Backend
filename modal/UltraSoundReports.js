const mongoose = require("mongoose");
const { Schema } = mongoose;

var UltraSoundReportsSchema = new Schema({
  description: { type: String, require: true },
  dateTime: { type: Date, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  patient: { type: mongoose.SchemaTypes.ObjectId, ref: "Patients" },
  ultraSoundEcgImage:  { type:  String, require: true},
  ultraSoundPdf:  { type:  String, require: true},

});
module.exports = mongoose.model("UltraSoundReportsSchema", UltraSoundReportsSchema, "UltraSoundReports");
