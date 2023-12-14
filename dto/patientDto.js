class PatientDto {
  constructor(patient) {
    (this._id = patient._id),
      (this.patient_name = patient.patient_name),
      (this.admit_date = patient.admit_date);
    this.image = patient.image;
    this.pdffile=patient.pdffile;
    this.user = {
      username: patient?.user?.username,
      id: patient?.user?._id,
      role:patient?.user?.role,
    };
    this.discharg_date = patient?.discharg_date;
    this.patient_cnic = patient?.patient_cnic;
    this.patient_case_type=patient?.patient_case_type
  }
}

module.exports = PatientDto;
