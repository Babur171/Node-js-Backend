const Joi = require("joi");
const Patients = require("../modal/Patients");
const PatientDto = require("../dto/patientDto");
var myregexp = /^[0-9a-fA-F]{24}$/;
const fs = require("fs");
const { BACKEND_URL_PATH } = require("../config/constants");

const PatientsController = {
  async addPatient(req, res, next) {
    var validateData = Joi.object({
      patient_name: Joi.string().required(),
      admit_date: Joi.date().required(),
      discharg_date: Joi.date().required(),
      patient_cnic: Joi.number().required(),
      patient_case_type:Joi.string().required(),
      user: Joi.string().regex(myregexp).required(),
      image: Joi.string().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const {
      patient_name,
      admit_date,
      discharg_date,
      patient_cnic,
      patient_case_type,
      user,
      image,
    } = req.body;
   
   
      const buffer = Buffer.from(
        image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imagePath = `image-${Date.now()}` + `-patientimage.png`;
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }

      let newPatientData;
      try {
        newPatientData = new Patients({
          patient_name,
          admit_date,
          discharg_date,
          patient_cnic,
          patient_case_type,
          user,
          image: `${BACKEND_URL_PATH}storage/${imagePath}`,
        });
        await newPatientData.save();
      } catch (err) {
        return next(err);
      }
      const newPatient = new PatientDto(newPatientData);
      return res.status(201).json({ patient: newPatient });
    
  },

  async getPatients(req, res, next) {
    let newPatientData;
    try {

      if(req.user.role.toLowerCase() !=="admin" ){
        newPatientData = await Patients.find({patient_case_type:req.user.role.toLowerCase()});
      } else {
        newPatientData = await Patients.find();
      }
        return res.status(200).json({ patients: newPatientData?.length ?newPatientData:[]  });
     
    } catch (err) {
      return next(err);
    }
  },
  // async postById(req, res, next) {
  //   var validateData = Joi.object({
  //     id: Joi.string().regex(myregexp).required(),
  //   });
  //   const { error } = validateData.validate(req.params);
  //   if (error) {
  //     next(error);
  //   }
  //   const id = req.params.id;
  //   let newPostData;
  //   try {
  //     newPostData = await Post.findById({ _id: id })
  //       .populate("author")
  //       .populate("comments");
  //     if (!newPostData) {
  //       let error = {
  //         status: 400,
  //         message: "not found post",
  //       };
  //       return next(error);
  //     }
  //   } catch (err) {
  //     return next(err);
  //   }
  //   const newPost = new PostDtoById(newPostData);
  //   return res.status(200).json({ post: newPost });
  // },
  // async postDelete(req, res, next) {
  //   var validateData = Joi.object({
  //     id: Joi.string().regex(myregexp).required(),
  //   });
  //   const { error } = validateData.validate(req.params);
  //   if (error) {
  //     next(error);
  //   }
  //   const id = req.params.id;
  //   let newPostData;
  //   try {
  //     newPostData = await Post.findByIdAndDelete({ _id: id });
  //     if (!newPostData) {
  //       let error = {
  //         status: 400,
  //         message: "not found post",
  //       };
  //       return next(error);
  //     }
  //     await Comment.deleteMany({ post: id });
  //     await Likes.deleteMany({ post: id });
  //   } catch (err) {
  //     return next(err);
  //   }
  //   // const newPost = new PostDtoById(newPostData);
  //   return res.status(200).json({ post: { message: "deleteed" } });
  // },
  // async updatePosts(req, res, next) {
  //   var validateData = Joi.object({
  //     content: Joi.string(),
  //     title: Joi.string(),
  //     author: Joi.string().regex(myregexp).required(),
  //     image: Joi.string(),
  //   });
  //   const { error } = validateData.validate(req.body);
  //   if (error) {
  //     next(error);
  //   }
  //   const id = req.params.id;

  //   let newPostId;
  //   try {
  //     newPostId = await Post.findOne({ _id: id });
  //     if (!newPostId) {
  //       let error = {
  //         status: 400,
  //         message: "not found post",
  //       };
  //       return next(error);
  //     }
  //   } catch (err) {
  //     return next(err);
  //   }
  //   const { title, content, author, image } = req.body;

  //   let newPostData;

  //   if (image) {
  //     let prveiousImage = newPostId.image;
  //     prveiousImage = prveiousImage.split("/").at(-1);
  //     fs.unlinkSync(`storage/${prveiousImage}`);

  //     const buffer = Buffer.from(
  //       image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
  //       "base64"
  //     );
  //     const imageNewPath = `image-${Date.now()}` + `${author}.png`;
  //     try {
  //       fs.writeFileSync(`storage/${imageNewPath}`, buffer);
  //     } catch (error) {
  //       return next(error);
  //     }
  //     try {
  //       newPostData = await Post.findOneAndUpdate(
  //         { _id: id },
  //         {
  //           title,
  //           content,
  //           author,
  //           image: `${BACKEND_URL_PATH}storage/${imageNewPath}`,
  //         },
  //         {
  //           new: true,
  //         }
  //       );
  //     } catch (err) {
  //       return next(err);
  //     }
  //   } else {
  //     try {
  //       newPostData = await Post.updateOne(
  //         { _id: id },
  //         { title, content, author },
  //         {
  //           new: true,
  //         }
  //       );
  //     } catch (err) {
  //       return next(err);
  //     }
  //   }
  //   const newPost = new PostDto(newPostData);
  //   return res.status(200).json({ post: newPost });
  // },
};
module.exports = PatientsController;
