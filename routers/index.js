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
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/user");
  }
);
router.get("/user", UserController.googleLogin);
router.post("/task", auth, TaskController.addTask);
router.get("/task", auth, TaskController.getTask);
router.patch("/task/:id", auth, TaskController.updateTask);
router.post("/check-in", auth, LocationController.checkIn);
router.get("/check-in", auth, LocationController.getCheckIn);

// router.get("/refresh", controler.refreshTokens);
// router.post("/blog", auth, postControler.create);
// router.get("/blog", auth, postControler.getAll);
// router.get("/blog/:id", auth, postControler.getById);
// router.put("/blog", auth, postControler.update);
// router.delete("/blog/:id", auth, postControler.delete);
// router.post("/comment", auth, commentController.create);
// router.get("/comment/:id", auth, commentController.getById);

module.exports = router;
