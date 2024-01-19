class PatientDto {
  constructor(patient) {
    (this._id = patient._id),
      (this.patientName = patient.patientName),
      (this.admitDate = patient.admitDate);
    this.image = patient.image;
    this.pdffile=patient.pdffile;
    this.user = {
      username: patient?.user?.username,
      id: patient?.user?._id,
      role:patient?.user?.role,
    };
    this.dischargDate = patient?.dischargDate;
    this.patientCnic = patient?.patientCnic;
  }
}

module.exports = PatientDto;
