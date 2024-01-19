const Joi = require("joi");
const CheckUps = require("../modal/Checkup");
var myregexp = /^[0-9a-fA-F]{24}$/;
const {responseData} = require("../utiles/index")

const CheckupController = {
  async getCheckups(req, res, next) {
    const validateData = Joi.object({
      patient: Joi.string().regex(myregexp).required(),
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

    try {
      let checkup = await CheckUps.find({ patient: req.body.patient }).sort({ createdAt: -1 }); ;
      const response = responseData({
        success: true,
        data: checkup,
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

  async updateCheckup(req, res, next) {
    const validateData = Joi.object({
      dischargDate: Joi.date(),
      doctorChecked: Joi.boolean().required(),
      doctorDescription: Joi.string().required(),
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
    const checkupId = req.params.id;
    const { doctorChecked, dischargDate,doctorDescription } = req.body;

    const existingCheckup = await CheckUps.findById({ _id: checkupId });
    if (!existingCheckup) {
      const response = responseData({
        success: false,
        message: "Patient not found",
        status: 404,
      });
      return res.status(400).json(response);
    }

    try {
      existingCheckup.doctorChecked = doctorChecked;
      existingCheckup.doctorDescription = doctorDescription;
      existingCheckup.dischargDate = dischargDate
        ? dischargDate
        : existingCheckup.dischargDate;
      await existingCheckup.save();

      const response = responseData({
        success: true,
        data: existingCheckup,
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

  async newCheckup(req, res, next) {
    const validateData = Joi.object({
      admitDate: Joi.date().required(),
      patient: Joi.string().regex(myregexp).required(),
      time: Joi.string().required(),
      temp: Joi.string().required(),
      bloodPressure: Joi.string().required(),
      dischargDate: Joi.date(),
      doctorDescription: Joi.string(),
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
      admitDate,
      dischargDate,
      time,
      temp,
      bloodPressure,
      doctor,
      patient,
    } = req.body;

    try {
      const existingPatient = await CheckUps.findOne({
        patient: patient,
        doctorChecked:false
      });

      if (existingPatient) {
        const response = responseData({
          success: false,
          message: "Patient already booked",
          status: 400,
        });
        return res.status(400).json(response);
      }

      let checkup = new CheckUps({
        admitDate,
        dischargDate: dischargDate ? dischargDate : null,
        time,
        temp,
        bloodPressure,
        doctor,
        patient,
        doctorDescription:null
      });

      await checkup.save();
      const response = responseData({
        success: true,
        data: checkup,
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
};

module.exports = CheckupController;
