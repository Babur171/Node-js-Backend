const express = require("express");
const router = express.Router();
const UserController = require("../controller/User");
const PostController = require("../controller/Posts");
// const postControler = require("../controler/postControler");
// const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
// const commentController = require("../controler/commentController");

router.get("/", (req, res) => {
  res.json({ work: "workinggg" });
});
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/post", auth, PostController.addPosts);
router.get("/post/:id", auth, PostController.postById);
router.delete("/post/:id", auth, PostController.postDelete);

// router.get("/refresh", controler.refreshTokens);
// router.post("/blog", auth, postControler.create);
// router.get("/blog", auth, postControler.getAll);
// router.get("/blog/:id", auth, postControler.getById);
// router.put("/blog", auth, postControler.update);
// router.delete("/blog/:id", auth, postControler.delete);
// router.post("/comment", auth, commentController.create);
// router.get("/comment/:id", auth, commentController.getById);

module.exports = router;
