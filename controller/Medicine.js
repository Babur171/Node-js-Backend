const Joi = require("joi");
const Medicine = require("../modal/Medicine");
var myregexp = /^[0-9a-fA-F]{24}$/;
const {responseData} = require("../utiles/index")

const MedicineController = {
  async getMedicines(req, res, next) {

    try {
      let medicine = await Medicine.find().populate({
        path: "patient",
        select: "patientName _id mrNo"
      }).populate({
        path: "doctor",
        select: "username _id"}).sort({ createdAt: -1 }); 
      const response = responseData({
        success: true,
        data: medicine,
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

  async updateMedicine(req, res, next) {
    const validateData = Joi.object({
      status: Joi.boolean().required(),
      doctorMedicine: Joi.string(),
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
    const id = req.params.id;
    const { doctorMedicine, status } = req.body;

    const existingMedicine = await Medicine.findById({ _id: id });
    if (!existingMedicine) {
      const response = responseData({
        success: false,
        message: "Medicine not found",
        status: 404,
      });
      return res.status(400).json(response);
    }

    try {
      if(doctorMedicine){
        existingMedicine.doctorMedicine = doctorMedicine;
      }
     
      existingMedicine.status = status;
      await existingMedicine.save();

      const response = responseData({
        success: true,
        data: existingMedicine,
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

  async newMedicine(req, res, next) {
    const validateData = Joi.object({
      name: Joi.string().required(),
      patient: Joi.string().regex(myregexp).required(),
      doctorRecommended: Joi.string().required(),
      doctorMedicine: Joi.string().required()
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
      name,
      doctorRecommended,
      doctorMedicine,
      patient,
    } = req.body;

    try {
      let medicine = new Medicine({
        name,
        doctorRecommended,
        doctorMedicine,
        doctor:req.user._id,
        patient
      });

      await medicine.save();
      const response = responseData({
        success: true,
        data: medicine,
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

module.exports = MedicineController;
