const express = require("express");
const router = express.Router();
const UserController = require("../controller/User");
const PostController = require("../controller/Posts");
const TaskController = require("../controller/Tasks");

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
router.get("/post", auth, PostController.getPosts);
router.post("/post", auth, PostController.addPosts);
router.get("/post/:id", auth, PostController.postById);
router.delete("/post/:id", auth, PostController.postDelete);
router.patch("/post/:id", auth, PostController.updatePosts);
router.post("/comment", auth, PostController.commentPost);
router.get("/comment", auth, PostController.commentList);
router.post("/like_post", auth, PostController.postLike);

router.get("/user", UserController.googleLogin);
router.post("/task", auth, TaskController.addTask);
router.get("/task", auth, TaskController.getTask);
router.patch("/task/:id", auth, TaskController.updateTask);
router.post("/check-in", auth, LocationController.checkIn);
router.get("/check-in", auth, LocationController.getCheckIn);
router.post("/device", auth, TaskController.addDevice);
router.post("/notification", auth, TaskController.addNotification);
router.get("/notification", auth, TaskController.getNotification);
router.patch("/notification/:id", auth, TaskController.updateNotification);
router.get("/noti", auth, TaskController.paginate);
router.post("/auth/google", UserController.googleLoginApi);

module.exports = router;
