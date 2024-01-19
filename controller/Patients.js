const Joi = require("joi");
const mongoose = require("mongoose");
const Patients = require("../modal/Patients");
const Checkup = require("../modal/Checkup");
const User = require("../modal/User");
var myregexp = /^[0-9a-fA-F]{24}$/;
const fs = require("fs");
const { handleFileUpload } = require("../middleware/upload"); // Adjust the path as needed
const LabReports = require("../modal/LabReports");
const { responseData } = require("../utiles/index");
const Medicine = require("../modal/Medicine");
const S3 = require("../config/s3Bucket");
const { v4: uuidv4 } = require("uuid");

function deleteFile(path) {
  if (path) {
    fs.unlinkSync(path);
  }
}

const PatientsController = {
  async addPatient(req, res, next) {
    const validateData = Joi.object({
      mrNo: Joi.number().required(),
      patientName: Joi.string().required(),
      admitDate: Joi.date().required(),
      patientCnic: Joi.string().required(),
      fatherName: Joi.string().required(),
      patientType: Joi.string().required(),
      gender: Joi.boolean().required(),
      age: Joi.number().required(),
      time: Joi.string().required(),
      address: Joi.string().required(),
      temp: Joi.string().required(),
      bloodPressure: Joi.string().required(),
      dischargDate: Joi.string(),
      doctor: Joi.string().regex(myregexp).required(),
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

    const {
      mrNo,
      patientName,
      admitDate,
      patientCnic,
      dischargDate,
      doctor,
      fatherName,
      gender,
      age,
      address,
      time,
      temp,
      bloodPressure,
      patientType,
    } = req.body;

    // Handle image and PDF upload using GridFS
    let imageUrl;

    try {
      const existingDoctor = await User.findById({ _id: doctor });
      if (!existingDoctor) {
        const response = responseData({
          success: false,
          message: "No doctor found",
          status: 400,
        });
        return res.status(400).json(response);
      }
      if (req.files && req.files.patientImage) {
        try {
          imageUrl = await handleFileUpload(
            req?.files?.patientImage[0],
            "upload/images/"
          );
        } catch (error) {
          const response = responseData({
            success: false,
            message: error,
            status: 404,
          });
          return res.status(404).json(response);
        }
      }
    
      let newPatientData = new Patients({
        mrNo,
        patientName,
        patientCnic,
        patientImage: imageUrl || null,
        fatherName,
        gender,
        patientType,
        age,
        address,
      });
      await newPatientData.save();

      let checkup = new Checkup({
        admitDate,
        dischargDate: dischargDate ? dischargDate : null,
        time,
        temp,
        bloodPressure,
        doctor,
        patient: newPatientData._id,
      });

      await checkup.save();
      const response = responseData({
        success: true,
        message: "New patient added",
        status: 201,
      });
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const errorMessages = Object.keys(error.errors).map(
          (key) => error.errors[key].message
        );
        const errorObjects = errorMessages.reduce((acc, message, index) => {
          return message;
        }, {});

        const errorMessage = errorObjects;
        const response = responseData({
          success: false,
          message: errorMessage,
          status: 400,
        });
        return res.status(400).json(response);
      }
    }
  },

  async getDoctorPatients(req, res, next) {
    let newPatientData;

    try {
      const checkups = await Checkup.find({
        doctor: req.user._id,
        doctorChecked: false,
      }).sort({ createdAt: -1 });
      const patientIds = checkups.map((checkup) => checkup.patient);

      newPatientData = await Patients.find({ _id: { $in: patientIds } });
      const response = responseData({
        success: true,
        data: newPatientData?.length ? newPatientData : [],
        status: 200,
      });

      return res.status(200).json(response);
    } catch (err) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });

      return res.status(400).json(response);
    }
  },

  async getSingleDoctorPatient(req, res, next) {
    let newPatientData;
    const patientId = req.params.id;

    try {
      const latestUncheckedCheckup = await Checkup.findOne({
        patient: patientId,
      }).sort({ createdAt: -1 });
      const checkups = await Checkup.find({
        patient: patientId,
        // _id: { $ne: latestUncheckedCheckup?._id },
      })
        .populate({
          path: "doctor",
          select: "username _id",
        })
        .sort({ createdAt: -1 });

      const labReports = await LabReports.find({
        patient: patientId,
      }).sort({ createdAt: -1 });
      const medicines = await Medicine.find({
        patient: patientId,
      })
        .populate({
          path: "doctor",
          select: "username _id",
        })
        .sort({ createdAt: -1 });

      newPatientData = await Patients.findOne({ _id: patientId });
      // Map over each patient and add checkups and labReports data
      const enhancedPatientData = {
        ...newPatientData.toObject(), // Convert to plain JS object if it's a Mongoose document
        checkups,
        labReports,
        medicines,
        latestUnchecked: latestUncheckedCheckup
          ? latestUncheckedCheckup
          : false,
      };
      const response = responseData({
        success: true,
        data: { patients: enhancedPatientData ? enhancedPatientData : {} },
        status: 200,
      });

      return res.status(200).json(response);
    } catch (err) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });

      return res.status(400).json(response);
    }
  },

  async getPatients(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        isCheckup = "false",
      } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
          totalDocs: "totalRecords",
          docs: "patients",
        },
      };
      const regexSearch = new RegExp(search, "i");
      // Fetch patient IDs with at least one checkup with doctorChecked: true
      const patientIdsWithDoctorChecked = await Checkup.distinct("patient", {
        doctorChecked: JSON.parse(isCheckup.toLowerCase()),
      });

      // Fetch the latest checkup for each patient with doctorChecked: true
      const latestCheckups = await Checkup.aggregate([
        {
          $match: {
            patient: { $in: patientIdsWithDoctorChecked },
            doctorChecked: JSON.parse(isCheckup.toLowerCase()),
          },
        },
        {
          $sort: { checkupDate: -1 },
        },
        {
          $group: {
            _id: "$patient",
            latestCheckup: { $first: "$$ROOT" },
          },
        },
      ]);

      // Extract patient IDs from the latest checkups
      const patientIds = latestCheckups.map((item) => item._id);

      // Fetch patients based on search criteria and patient IDs
      const result = await Patients.paginate(
        {
          $and: [
            {
              $or: [
                { patientName: { $regex: regexSearch } },
                { patientCnic: { $regex: regexSearch } },
              ],
            },
            {
              _id: { $in: patientIds },
            },
          ],
        },
        options
      );

      const populatedLatestCheckups = await Checkup.populate(latestCheckups, {
        path: "doctor",
        select: "username _id",
      });

      // Fetch the doctors based on the doctor IDs
      const latestCheckupIds = populatedLatestCheckups.map(
        (item) => item.latestCheckup.doctor
      );
      const populatedDoctors = await User.find({
        _id: { $in: latestCheckupIds },
      })
        .select("username _id")
        .exec();

      // Map the populated doctors to the corresponding latest checkups
      const modifiedLatestCheckups = populatedLatestCheckups.map((item) => {
        const doctor = populatedDoctors.find((doc) =>
          doc._id.equals(item.latestCheckup.doctor)
        );
        return {
          ...item,
          latestCheckup: {
            ...item.latestCheckup,
            doctor: doctor || null,
          },
        };
      });

      // Map the modified latest checkups to the corresponding patients
      const patientsWithLatestCheckup = result.patients.map((patient) => {
        const modifiedLatestCheckup = modifiedLatestCheckups.find((item) =>
          item._id.equals(patient._id)
        );
        return {
          ...patient._doc,
          latestCheckup: modifiedLatestCheckup
            ? modifiedLatestCheckup.latestCheckup
            : null,
        };
      });

      // Paginate the list of patients with latest checkups
      const paginatedPatients = patientsWithLatestCheckup.slice(
        (page - 1) * limit,
        page * limit
      );

      const response = responseData({
        success: true,
        data: {
          totalRecords: patientsWithLatestCheckup.length,
          totalPages: Math.ceil(patientsWithLatestCheckup.length / limit),
          currentPage: page,
          results: paginatedPatients,
          nextPage:
            page < Math.ceil(patientsWithLatestCheckup.length / limit)
              ? page + 1
              : null,
          prevPage: page > 1 ? page - 1 : null,
        },
        status: 200,
      });

      return res.status(200).json(response);
    } catch (err) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },

  async deletePatient(req, res, next) {
    try {
      const patientId = req.params.id;
      const existingPatient = await Patients.findById(patientId);

      if (!existingPatient) {
        const response = responseData({
          success: false,
          message: "Patient not found",
          status: 404,
        });

        return res.status(404).json(response);
      }

      await Patients.findOneAndDelete({ _id: patientId });
      const response = responseData({
        success: true,
        message: "Patient deleted",
        data: {},
        status: 200,
      });
      return res.status(200).json(response);
    } catch (err) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },

  async updatePatient(req, res, next) {
    try {
      const patientId = req.params.patientId;
      const existingPatient = await Patients.findById(patientId);
    
      if (!existingPatient) {
        const response = responseData({
          success: false,
          message: "Patient not found",
          status: 404,
        });
        return res.status(404).json(response);
      }
    
      // Validate request data
      const validateData = Joi.object({
        patientName: Joi.string().required(),
        fatherName: Joi.string().required(),
        gender: Joi.boolean().required(),
        age: Joi.number().required(),
        address: Joi.string().required(),
      });
    
      const { error } = validateData.validate(req.body);
      if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        const response = responseData({
          success: false,
          message: errorMessage,
          status: 400,
        });
        return res.status(400).json(response);
      }
      const { patientName, fatherName, gender, age, address } = req.body;
      // Handle image upload
      let imageUrl;
      if (req.files && req.files.patientImage) {
        try {
          imageUrl = await handleFileUpload(req.files.patientImage[0], "upload/images/");
        } catch (error) {
          const response = responseData({
            success: false,
            message: "Error uploading image",
            status: 500,
          });
          return res.status(500).json(response);
        }
      }
    
      // Update patient data
      existingPatient.patientName = patientName;
      existingPatient.fatherName = fatherName;
      existingPatient.gender = gender;
      existingPatient.age = age;
      existingPatient.address = address;
    
      // Update image URL if provided
      if (imageUrl) {
        existingPatient.patientImage = imageUrl;
      }
      try {
        const updatedPatient = await existingPatient.save();
    
        const response = responseData({
          success: true,
          data: updatedPatient,
          status: 200,
        });
    
        return res.status(200).json(response);
      } catch (saveError) {
        const response = responseData({
          success: false,
          message: "Error saving updated patient",
          status: 500,
        });
        return res.status(500).json(response);
      }
    } catch (error) {
      const response = responseData({
        success: false,
        message: "Error updating patient",
        status: 500,
      });
      return res.status(500).json(response);
    }
  },
};
module.exports = PatientsController;
