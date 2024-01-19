const express = require("express");
const router = express.Router();
const UserController = require("../controller/User");
const PatientsController = require("../controller/Patients");
const PatientsReportsController = require("../controller/PatientReports");
const CheckupController = require("../controller/Checkup");
// const S3 =require("../config/s3Bucket")

const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const { upload } = require("../middleware/upload"); // Adjust the path as needed
const MedicineController = require("../controller/Medicine");

router.get("/", (req, res, next) => {
  // S3.createBucket({ Bucket: "hospital-s3-bucket0198" }, (err, data) => {
  //   if (err) {
  //     console.error("Error creating S3 bucket:", err);
  //   } else {
  //     console.log("S3 bucket created successfully:", data.Location);
  //   }
  // });

  res.status(200).json({
    message: "deployed",
  });
});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/roles", auth, checkRole(701), UserController.addUserRoles);
router.get("/roles", UserController.userRoles);
router.get("/doctors", auth, checkRole(702), UserController.doctorsList);

router.post(
  "/patient",
  auth,
  checkRole(702),
  upload.fields([{ name: "patientImage" }]),
  PatientsController.addPatient
);
router.get("/patient", auth, checkRole(702), PatientsController.getPatients);
router.delete(
  "/patient/:id",
  auth,
  checkRole(702),
  PatientsController.deletePatient
);

router.get(
  "/doctors-patients",
  auth,
  checkRole(704),
  PatientsController.getDoctorPatients
);
router.get(
  "/doctors-patients/:id",
  auth,
  checkRole([704, 702]),
  PatientsController.getSingleDoctorPatient
);

router.get("/checkup", auth, checkRole(704), CheckupController.getCheckups);
router.post("/checkup", auth, checkRole(702), CheckupController.newCheckup);

router.patch(
  "/checkup/:id",
  auth,
  checkRole(704),
  CheckupController.updateCheckup
);

router.patch(
  "/patient/:patientId",
  auth,
  checkRole(702),
  upload.fields([{ name: "patientImage" }]),
  PatientsController.updatePatient
);

router.post(
  "/lab-reports",
  auth,
  checkRole(704),
  upload.fields([{ name: "labReportImage" }, { name: "labReportPdf" }]),
  PatientsReportsController.addPatientLabReports
);

router.patch(
  "/lab-reports/:id",
  auth,
  checkRole(703),
  upload.fields([{ name: "labReportImage" }, { name: "labReportPdf" }]),
  PatientsReportsController.updatePatientLabReports
);

router.post("/medicine", auth, checkRole(704), MedicineController.newMedicine);

router.patch(
  "/medicine/:id",
  auth,
  checkRole(705),
  MedicineController.updateMedicine
);

router.get("/medicine", auth, checkRole(705), MedicineController.getMedicines);
// router
//   .post(
//     "/ultra-sound-reports",
//     auth,
//     upload.fields([
//       { name: "ultra_sound_ecg_image" },
//       { name: "ultra_sound_pdf" },
//     ]),
//     PatientsReportsController.addPatientUltraSoundReports
//   )
//   .post(
//     "/xray-reports",
//     auth,
//     upload.fields([{ name: "xray_report_image" }, { name: "xray_report_pdf" }]),
//     PatientsReportsController.addPatientXrayReports
//   );

router
  // .get("/ecg-reports", PatientsReportsController.getAllPatientsEcgReport)
  // .get(
  //   "/ultra-sound-reports",
  //   PatientsReportsController.getAllPatientsultraSoundReports
  // )
  // .get("/xray-reports", PatientsReportsController.getAllPatientsXrayReports)
  .get(
    "/lab-reports",
    auth,
    checkRole(703),
    PatientsReportsController.getAllPatientsLabgReport
  );

module.exports = router;
