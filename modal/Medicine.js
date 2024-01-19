const mongoose = require("mongoose");
const { Schema } = mongoose;

var MedicineSchema = new Schema({
  name: { type: String, require: true },
  doctorRecommended: { type: String, require: true },
  doctorMedicine: { type: String, require: true },
  doctor: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  patient: { type: mongoose.SchemaTypes.ObjectId, ref: "Patients" },
  status: { type: Boolean, require: true, default:false }
},{
  timestamps: true
});

module.exports = mongoose.model("Medicines", MedicineSchema, "medicines");
