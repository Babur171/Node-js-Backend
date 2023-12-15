const express = require("express");
const router = express.Router();
const UserController = require("../controller/User");
const PostController = require("../controller/Posts");
const TaskController = require("../controller/Tasks");
// const PatientsController = require("../controller/Patients");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Image = require("../modal/Images");

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


// const postControler = require("../controler/postControler");
const passport = require("passport");
// const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
const LocationController = require("../controller/Location");
// const commentController = require("../controler/commentController");

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "deployed",
  });
});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/reset-password", UserController.sendResetEmail);

// router.post("/patient",auth, PatientsController.addPatient);
// router.get("/patient",auth,  PatientsController.getPatients);
// router.patch("/patient/:patientId",auth,  PatientsController.updatePatient);


router.get("/post", auth, PostController.getPosts);
router.post("/post", auth, PostController.addPosts);
router.get("/post/:id", auth, PostController.postById);
router.delete("/post/:id", auth, PostController.postDelete);
router.patch("/post/:id", auth, PostController.updatePosts);
router.post("/comment", auth, PostController.commentPost);
router.get("/comment", auth, PostController.commentList);
router.post("/like_post", auth, PostController.postLike);

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Save the image information to MongoDB using your Image model
    const newImage = new Image({
      filename: req.file.filename,
      contentType: req.file.mimetype,
      uploadDate: new Date(),
    });
    await newImage.save();

    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/user", UserController.googleLogin);
router.post("/task", auth, TaskController.addTask);
router.get("/task", auth, TaskController.getTask);
router.patch("/task/:id", auth, TaskController.updateTask);
router.delete("/task/:id", auth, TaskController.deleteTask);
router.post("/check-in", auth, LocationController.checkIn);
router.get("/check-in", auth, LocationController.getCheckIn);
router.post("/device", auth, TaskController.addDevice);
router.post("/notification", auth, TaskController.addNotification);
router.get("/notification", auth, TaskController.getNotification);
router.patch("/notification/:id", auth, TaskController.updateNotification);
router.get("/noti", auth, TaskController.paginate);
router.post("/auth/google", UserController.googleLoginApi);

module.exports = router;
