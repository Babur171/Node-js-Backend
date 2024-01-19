const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

var PatientsSchema = new Schema({
  patientName: { type: String, require: true },
  mrNo: { type: Number, require: true, unique: true  },
  fatherName: { type: String, require: true },
  patientType: { type: String, require: true },
  gender: { type: Boolean, require: true },
  age: { type: Number, require: true },
  address: { type: String, require: true },
  patientCnic: { type: String, require: true, unique: true },
  patientImage: { type: String, require: true }
},{
  timestamps: true
});

// Adding a custom validation for the compound unique constraint on mrNo
PatientsSchema.path('mrNo').validate(async function(value) {
  const count = await this.constructor.countDocuments({ mrNo: value, _id: { $ne: this._id } });
  return !count; // Return false if count is greater than 0 (i.e., not unique)
}, 'Patient with this MR number already exists.');

PatientsSchema.path('patientCnic').validate(async function(value) {
  const count = await this.constructor.countDocuments({ patientCnic: value, _id: { $ne: this._id } });
  return !count; // Return false if count is greater than 0 (i.e., not unique)
}, 'Patient with this CNIC already exists.');
PatientsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Patients", PatientsSchema, "patients");
