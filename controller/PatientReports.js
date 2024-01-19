const Joi = require("joi");
const Patients = require("../modal/Patients");

const EcgReports = require("../modal/EcgReports");
const LabReports = require("../modal/LabReports");
const UltraSoundReports = require("../modal/UltraSoundReports");
const XrayReports = require("../modal/XrayReports");
const {responseData} = require("../utiles/index")

var myregexp = /^[0-9a-fA-F]{24}$/;
const fs = require("fs");
const { handleFileUpload } = require("../middleware/upload");

function deleteFile(path) {
  if (path) {
    fs.unlinkSync(path);
  }
}

const PatientsReportsController = {
  async getAllPatientsLabgReport(req, res, next) {
    try {
      const filter = req.query.complete || "";
      const findData = await LabReports.find({
        reportUpload: filter ? filter : false,
      }).populate("patient").sort({ createdAt: -1 }); ;
      const response = responseData({
        success: true,
        data: findData,
        status: 200,
      });
      return res.status(200).json(response);
    } catch (error) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },

  async addPatientLabReports(req, res, next) {
    const validateData = Joi.object({
      patient: Joi.string().regex(myregexp).required(),
      doctorTestDescription: Joi.string().required(),
    });

    const { error } = validateData.validate(req.body);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      const response = responseData({
        success: false,
        message: errorMessage,
        status: 400,
      });

      return res.status(400).json(response);
    }
    const { patient, doctorTestDescription } = req.body;

    const existingLabReport = await LabReports.findOne({
      patient: patient,
      reportUpload: false,
    });

    if (existingLabReport) {
      const response = responseData({
        success: false,
        message: "Already lab patient request",
        status: 400,
      });
      return res.status(400).json(response);
    }

    try {
      let newLabPatientData = new LabReports({
        patient,
        doctor:req.user._id,
        doctorTestDescription
      });

      const data = await newLabPatientData.save();
      const response = responseData({
        success: true,
        data,
        status: 200,
      });
      return res.status(200).json(response);
    } catch (error) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },

  async updatePatientLabReports(req, res, next) {
    const id = req.params.id;
    const existingLabReport = await LabReports.findById({
      _id: id,
    });

    if (!existingLabReport) {
      const response = responseData({
        success: false,
        message:"Lab report not found.",
        status: 400,
      });
  
      return res.status(400).json(response);
    }

    const validateData = Joi.object({
      description: Joi.string().required(),
      dateTime: Joi.date().required()
    });

    const { error } = validateData.validate(req.body);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      const response = responseData({
        success: false,
        message: errorMessage,
        status: 400,
      });

      return res.status(400).json(response);
    }

    const { description, dateTime } = req.body;

    // Handle image and PDF upload using GridFS
    let imageUrl, pdfUrl;

    try {
      if (req?.files && req.files.labReportImage) {
        imageUrl = await handleFileUpload(
          req.files.labReportImage[0],
          "upload/images/"
        );
      }

      if (req?.files && req.files.labReportPdf) {
        pdfUrl = await handleFileUpload(req.files.labReportPdf[0],  "upload/pdfs/");
      }

      existingLabReport.description = description;
      existingLabReport.dateTime = dateTime;
      existingLabReport.user = req.user._id;
      existingLabReport.labReportImage = imageUrl ? imageUrl: existingLabReport?.labReportImage|| null;
      existingLabReport.labReportPdf = pdfUrl?pdfUrl: existingLabReport?.labReportPdf|| null;
      existingLabReport.reportUpload = true;

      const data = await existingLabReport.save();
      const response = responseData({
        success: true,
        data,
        status: 200,
      });

      return res.status(200).json(response);
    } catch (error) {
      if (imageUrl) {
        deleteFile(imageUrl);
      }

      if (pdfUrl) {
        deleteFile(pdfUrl);
      }
      const response = responseData({
        success: false,
        message: error,
        status: 400,
      });

      return res.status(400).json(response);
    }
  },

  async addPatientEcgReport(req, res, next) {
    const validateData = Joi.object({
      description: Joi.string().required(),
      date_time: Joi.date().required(),
      patient: Joi.string().regex(myregexp).required(),
      user: Joi.string().regex(myregexp).required(),
    });

    const { error } = validateData.validate(req.body);
    if (error) {
      return next(error);
    }

    const { description, date_time, patient, user } = req.body;

    // Handle image and PDF upload using GridFS
    let imageUrl, pdfUrl;

    try {
      if (req.files && req.files.ecg_report_image) {
        imageUrl = await handleFileUpload(
          req.files.ecg_report_image[0],
          "images"
        );
      }

      if (req.files && req.files.ecg_report_pdf) {
        pdfUrl = await handleFileUpload(req.files.ecg_report_pdf[0], "pdfs");
      }

      let newEcgPatientData = new EcgReports({
        description,
        date_time,
        patient,
        user,
        ecg_report_image: imageUrl || null,
        ecg_report_pdf: pdfUrl || null,
      });

      const data = await newEcgPatientData.save();
      // const newPatient = new PatientDto(newEcgPatientData);
      return res.status(201).json({ data });
    } catch (error) {
      if (imageUrl) {
        deleteFile(imageUrl);
      }

      if (pdfUrl) {
        deleteFile(pdfUrl);
      }

      return next(error);
    }
  },
  async addPatientUltraSoundReports(req, res, next) {
    const validateData = Joi.object({
      description: Joi.string().required(),
      dateTime: Joi.date().required(),
      patient: Joi.string().regex(myregexp).required(),
      user: Joi.string().regex(myregexp).required(),
    });

    const { error } = validateData.validate(req.body);
    if (error) {
      return next(error);
    }

    const { description, dateTime, patient, user } = req.body;

    // Handle image and PDF upload using GridFS
    let imageUrl, pdfUrl;

    try {
      if (req.files && req.files.ultraSoundEcgImage) {
        imageUrl = await handleFileUpload(
          req.files.ultraSoundEcgImage[0],
          "images"
        );
      }

      if (req.files && req.files.ultraSoundPdf) {
        pdfUrl = await handleFileUpload(req.files.ultraSoundPdf[0], "pdfs");
      }

      let newUltraSoundPatientData = new UltraSoundReports({
        description,
        dateTime,
        patient,
        user,
        ultraSoundEcgImage: imageUrl || null,
        ultraSoundPdf: pdfUrl || null,
      });

      const data = await newUltraSoundPatientData.save();
      // const newPatient = new PatientDto(newEcgPatientData);
      return res.status(201).json({ data });
    } catch (error) {
      if (imageUrl) {
        deleteFile(imageUrl);
      }

      if (pdfUrl) {
        deleteFile(pdfUrl);
      }

      return next(error);
    }
  },
  async addPatientXrayReports(req, res, next) {
    const validateData = Joi.object({
      description: Joi.string().required(),
      dateTime: Joi.date().required(),
      patient: Joi.string().regex(myregexp).required(),
      user: Joi.string().regex(myregexp).required(),
    });

    const { error } = validateData.validate(req.body);
    if (error) {
      return next(error);
    }

    const { description, dateTime, patient, user } = req.body;

    // Handle image and PDF upload using GridFS
    let imageUrl, pdfUrl;

    try {
      if (req.files && req.files.xrayReportImage) {
        imageUrl = await handleFileUpload(
          req.files.xrayReportImage[0],
          "images"
        );
      }

      if (req.files && req.files.xrayReportPdf) {
        pdfUrl = await handleFileUpload(req.files.xrayReportPdf[0], "pdfs");
      }

      let newXrayPatientData = new XrayReports({
        description,
        dateTime,
        patient,
        user,
        xrayReportImage: imageUrl || null,
        xrayReportPdf: pdfUrl || null,
      });

      const data = await newXrayPatientData.save();
      // const newPatient = new PatientDto(newEcgPatientData);
      return res.status(201).json({ data });
    } catch (error) {
      if (imageUrl) {
        deleteFile(imageUrl);
      }

      if (pdfUrl) {
        deleteFile(pdfUrl);
      }

      return next(error);
    }
  },

  async getAllPatientsEcgReport(req, res, next) {
    try {
      const findData = await EcgReports.find().populate("patient");
      return res.status(200).json({ patients: findData });
    } catch (error) {
      return next(error);
    }
  },
  async getAllPatientsultraSoundReports(req, res, next) {
    try {
      const findData = await UltraSoundReports.find().populate("patient");
      return res.status(200).json({ patients: findData });
    } catch (error) {
      return next(error);
    }
  },
  async getAllPatientsXrayReports(req, res, next) {
    try {
      const findData = await XrayReports.find().populate("patient");
      return res.status(200).json({ patients: findData });
    } catch (error) {
      return next(error);
    }
  },
};
module.exports = PatientsReportsController;
