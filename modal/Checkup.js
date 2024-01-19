const mongoose = require("mongoose");
const { Schema } = mongoose;

var CheckupSchema = new Schema({
  doctor: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  patient: { type: mongoose.SchemaTypes.ObjectId, ref: "Patients" },
  time: { type: String, require: true },
  temp: { type: String, require: true },
  bloodPressure: { type: String, require: true },
  admitDate: { type: Date, require: true },
  dischargDate: { type: Date },
  doctorChecked: { type: Boolean, default: false },
  doctorDescription:{ type: String },
},{
  timestamps: true
});
module.exports = mongoose.model("Checkup", CheckupSchema, "Checkup");
