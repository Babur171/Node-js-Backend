const Joi = require("joi");
const Patients = require("../modal/Patients");
const PatientDto = require("../dto/patientDto");
var myregexp = /^[0-9a-fA-F]{24}$/;
const fs = require("fs");
const { BACKEND_URL_PATH } = require("../config/constants");
const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

function deleteFile(path) {
  if (path) {
    fs.unlinkSync(path);
  }
}

const PatientsController = {
  async addPatient(req, res, next) {
    upload.fields([{ name: "image" }, { name: "pdffile" }])(
      req,
      res,
      async function (err) {
        if (err) {
          return next(err);
        }

        const validateData = Joi.object({
          patient_name: Joi.string().required(),
          admit_date: Joi.date().required(),
          patient_cnic: Joi.number().required(),
          patient_case_type: Joi.string().required(),
          discharg_date: Joi.string(),

          user: Joi.string().regex(myregexp).required(),
        });

        const { error } = validateData.validate(req.body);
        if (error) {
          // Delete files if they were uploaded before validation failed
          if (req.files && req.files.image) {
            deleteFile(req.files.image[0].path);
          }
          if (req.files && req.files.pdffile) {
            deleteFile(req.files.pdffile[0].path);
          }
          return next(error);
        }

        const {
          patient_name,
          admit_date,
          patient_cnic,
          patient_case_type,
          discharg_date,
          user,
        } = req.body;

        let imagePath, pdfFilePath;

        // Handle image upload
        if (req.files && req.files.image) {
          const imageFile = req.files.image[0];
          if (
            imageFile.mimetype !== "image/jpeg" &&
            imageFile.mimetype !== "image/png"
          ) {
            return next(new Error("Invalid image format"));
          }

          const imageFolder = "images";
          imagePath =
            `${imageFolder}/image-${Date.now()}` + `-patient-image.png`;

          try {
            // Ensure the folder exists
            if (!fs.existsSync(`/tmp/${imageFolder}`)) {
              fs.mkdirSync(`/tmp/${imageFolder}`);
            }

            fs.writeFileSync(`/tmp/${imagePath}`, imageFile.buffer);
          } catch (error) {
            deleteFile(imageFile.path);
            return next(error);
          }
        }

        // Handle pdffile upload
        if (req.files && req.files.pdffile) {
          const pdfFile = req.files.pdffile[0];
          const isPdf = req.files.pdffile[0].mimetype === "application/pdf";
          if (!isPdf) {
            return next(new Error("Invalid pdf format"));
          }

          const pdfFolder = "pdfs";
          const pdfFileName = `pdf-${Date.now()}.pdf`;

          pdfFilePath = path
            .join("storage", pdfFolder, pdfFileName)
            .replace(/\\/g, "/");

          try {
            // Ensure the folder exists
            if (!fs.existsSync(path.join("storage", pdfFolder))) {
              fs.mkdirSync(path.join("storage", pdfFolder), {
                recursive: true,
              });
            }

            fs.writeFileSync(pdfFilePath, pdfFile.buffer);
          } catch (error) {
            // Delete the file if an error occurs
            deleteFile(pdfFile.path);
            return next(error);
          }
        }

        let newPatientData;
        try {
          newPatientData = new Patients({
            patient_name,
            admit_date,
            patient_cnic,
            patient_case_type,
            discharg_date: discharg_date ? discharg_date : null,
            user,
            image: imagePath ? `${BACKEND_URL_PATH}storage/${imagePath}` : null,
            pdffile: pdfFilePath ? `${BACKEND_URL_PATH}${pdfFilePath}` : null,
          });
          await newPatientData.save();
        } catch (err) {
          // Delete the files if an error occurs
          deleteFile(`storage/${imagePath}`);
          deleteFile(pdfFilePath);
          return next(err);
        }

        const newPatient = new PatientDto(newPatientData);
        return res.status(201).json({ patient: newPatient });
      }
    );
  },

  async getPatients(req, res, next) {
    let newPatientData;
    try {
      if (req.user.role.toLowerCase() !== "admin") {
        newPatientData = await Patients.find({
          patient_case_type: req.user.role.toLowerCase(),
        });
      } else {
        newPatientData = await Patients.find();
      }
      return res
        .status(200)
        .json({ patients: newPatientData?.length ? newPatientData : [] });
    } catch (err) {
      return next(err);
    }
  },
  async updatePatient(req, res, next) {
    try {
      const patientId = req.params.patientId;
      const existingPatient = await Patients.findById(patientId);

      if (!existingPatient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      upload.fields([{ name: "image" }, { name: "pdffile" }])(
        req,
        res,
        async function (err) {
          if (err) {
            return next(err);
          }

          const validateData = Joi.object({
            patient_name: Joi.string().required(),
            admit_date: Joi.date().required(),
            patient_cnic: Joi.number().required(),
            patient_case_type: Joi.string().required(),
            discharg_date: Joi.string(),
            user: Joi.string().regex(myregexp).required(),
          });

          const { error } = validateData.validate(req.body);
          if (error) {
            // Delete files if they were uploaded before validation failed
            if (req.files && req.files.image) {
              deleteFile(req.files.image[0].path);
            }
            if (req.files && req.files.pdffile) {
              deleteFile(req.files.pdffile[0].path);
            }
            return next(error);
          }

          const {
            patient_name,
            admit_date,
            patient_cnic,
            patient_case_type,
            discharg_date,
            user,
          } = req.body;

          let imagePath = existingPatient.image;
          let pdfFilePath = existingPatient.pdffile;

          // Handle image upload
          if (req.files && req.files.image) {
            const imageFile = req.files.image[0];
            if (
              imageFile.mimetype !== "image/jpeg" &&
              imageFile.mimetype !== "image/png"
            ) {
              // Throw an error or send a response informing the user about invalid image format
              return next(new Error("Invalid image format"));
            }
            const imageFolder = "images";
            const oldImageFilename = imagePath
              ? imagePath.replace(
                  `${BACKEND_URL_PATH}storage/${imageFolder}/`,
                  ""
                )
              : null;
            imagePath =
              `${imageFolder}/image-${Date.now()}` + `-patient-image.png`;

            try {
              // Ensure the folder exists
              const storageFolderPath = path.join(
                __dirname,
                "..",
                "storage",
                imageFolder
              );
              
              if (!fs.existsSync(storageFolderPath)) {
                fs.mkdirSync(storageFolderPath, { recursive: true });
              }

              // Delete the old image file if it exists
           
              if (oldImageFilename) {
                const localImagePath = path
                  .join("storage", imageFolder,
                  oldImageFilename)
                  .replace(/\\/g, "/");

                if (fs.existsSync(localImagePath)) {
                  deleteFile(localImagePath);
                } else {
                  console.log(`File does not exist: ${localImagePath}`);
                }
              }

              fs.writeFileSync(`storage/${imagePath}`, imageFile.buffer);
            } catch (error) {
              // Delete the file if an error occurs
              deleteFile(imageFile.path);
              return next(error);
            }
          }

          // Handle pdffile upload
          if (req.files && req.files.pdffile) {
            const pdfFile = req.files.pdffile[0];
            const isPdf = req.files.pdffile[0].mimetype === "application/pdf";
            if (!isPdf) {
              return next(new Error("Invalid pdf format"));
            }

            const pdfFolder = "pdfs";
            const pdfFileRelativePath = path
              .join("storage", pdfFolder)
              .replace(/\\/g, "/");

            try {
              if (!fs.existsSync(pdfFileRelativePath)) {
                fs.mkdirSync(pdfFileRelativePath);
              }

              // Delete the old pdf file if it exists
              if (pdfFilePath) {
                const urlParts = pdfFilePath.split("/");
                const fileName = urlParts[urlParts.length - 1];

                const localFilePath = path
                  .join("storage/", "pdfs", fileName)
                  .replace(/\\/g, "/");

                if (fs.existsSync(localFilePath)) {
                  deleteFile(localFilePath);
                } else {
                  console.log(`File does not exist: ${localFilePath}`);
                }
              }

              // Generate a new unique filename
              const pdfFileName = `pdf-${Date.now()}.pdf`;
              pdfFilePath = path
                .join("storage", pdfFolder, pdfFileName)
                .replace(/\\/g, "/");

              fs.writeFileSync(pdfFilePath, pdfFile.buffer);
            } catch (error) {
              // Delete the file if an error occurs
              deleteFile(pdfFile.path);
              return next(error);
            }
          }

          existingPatient.patient_name = patient_name;
          existingPatient.admit_date = admit_date;
          existingPatient.patient_cnic = patient_cnic;
          existingPatient.patient_case_type = patient_case_type;
          existingPatient.discharg_date = discharg_date
            ? discharg_date
            : existingPatient.discharg_date;
          existingPatient.user = user;

          // Handle image upload
          if (req.files && req.files.image) {
            existingPatient.image = imagePath
              ? `${BACKEND_URL_PATH}storage/${imagePath}`
              : existingPatient.image;
          }
          if (req.files && req.files.pdffile) {
            existingPatient.pdffile = pdfFilePath
              ? `${BACKEND_URL_PATH}${pdfFilePath}`
              : existingPatient.pdffile;
          }

          await existingPatient.save();

          const updatedPatient = new PatientDto(existingPatient);
          return res.status(200).json({ patient: updatedPatient });
        }
      );
    } catch (error) {
      return next(error);
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
