const Joi = require("joi");
const Post = require("../modal/Post");
const PostDto = require("../dto/postdto");
const PostDtoById = require("../dto/postdtoById");
const Comment = require("../modal/Comment");
var myregexp = /^[0-9a-fA-F]{24}$/;
const fs = require("fs");
const { BACKEND_URL_PATH } = require("../config/index");
const Likes = require("../modal/Likes");

const PostController = {
  async addPosts(req, res, next) {
    var validateData = Joi.object({
      content: Joi.string().required(),
      title: Joi.string().required(),
      author: Joi.string().regex(myregexp).required(),
      image: Joi.string().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const { title, content, author, image } = req.body;
    const buffer = Buffer.from(
      image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );
    const imagePath = `image-${Date.now()}` + `${author}.png`;
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }

    let newPostData;
    try {
      console.log("BACKEND_URL_PATHBACKEND_URL_PATH", BACKEND_URL_PATH);
      newPostData = new Post({
        title,
        content,
        author,
        image: `${BACKEND_URL_PATH}storage/${imagePath}`,
      });
      await newPostData.save();
    } catch (err) {
      return next(err);
    }
    const newPost = new PostDto(newPostData);
    return res.status(201).json({ post: newPost });
  },
  async getPosts(req, res, next) {
    let newPostData;
    try {
      newPostData = await Post.find({ author: req.user._id });
      let allPosts = [];
      let i;
      for (let i = 0; i < newPostData.length; i++) {
        const blog = await Post.findById(newPostData[i]._id).populate("author");
        if (blog) {
          const dto = new PostDto(blog);
          allPosts.push(dto);
        }
      }
      return res.status(200).json({ posts: allPosts });
    } catch (err) {
      return next(err);
    }
  },
  async postById(req, res, next) {
    var validateData = Joi.object({
      id: Joi.string().regex(myregexp).required(),
    });
    const { error } = validateData.validate(req.params);
    if (error) {
      next(error);
    }
    const id = req.params.id;
    let newPostData;
    try {
      newPostData = await Post.findById({ _id: id })
        .populate("author")
        .populate("comments");
      if (!newPostData) {
        let error = {
          status: 400,
          message: "not found post",
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
    const newPost = new PostDtoById(newPostData);
    return res.status(200).json({ post: newPost });
  },
  async postDelete(req, res, next) {
    var validateData = Joi.object({
      id: Joi.string().regex(myregexp).required(),
    });
    const { error } = validateData.validate(req.params);
    if (error) {
      next(error);
    }
    const id = req.params.id;
    let newPostData;
    try {
      newPostData = await Post.findByIdAndDelete({ _id: id });
      if (!newPostData) {
        let error = {
          status: 400,
          message: "not found post",
        };
        return next(error);
      }
      console.log("newPostDatanewPostData", newPostData);
    } catch (err) {
      return next(err);
    }
    // const newPost = new PostDtoById(newPostData);
    return res.status(200).json({ post: { message: "deleteed" } });
  },
  async updatePosts(req, res, next) {
    var validateData = Joi.object({
      content: Joi.string(),
      title: Joi.string(),
      author: Joi.string().regex(myregexp).required(),
      image: Joi.string(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const id = req.params.id;

    let newPostId;
    try {
      newPostId = await Post.findOne({ _id: id });
      if (!newPostId) {
        let error = {
          status: 400,
          message: "not found post",
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
    const { title, content, author, image } = req.body;

    let newPostData;

    if (image) {
      let prveiousImage = newPostId.image;
      console.log("prveiousImageprveiousImage", prveiousImage);
      prveiousImage = prveiousImage.split("/").at(-1);
      fs.unlinkSync(`storage/${prveiousImage}`);

      const buffer = Buffer.from(
        image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imageNewPath = `image-${Date.now()}` + `${author}.png`;
      try {
        fs.writeFileSync(`storage/${imageNewPath}`, buffer);
      } catch (error) {
        return next(error);
      }
      try {
        newPostData = await Post.findOneAndUpdate(
          { _id: id },
          {
            title,
            content,
            author,
            image: `${BACKEND_URL_PATH}storage/${imageNewPath}`,
          },
          {
            new: true,
          }
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        newPostData = await Post.updateOne(
          { _id: id },
          { title, content, author },
          {
            new: true,
          }
        );
      } catch (err) {
        return next(err);
      }
    }
    const newPost = new PostDto(newPostData);
    return res.status(200).json({ post: newPost });
  },
  async commentPost(req, res, next) {
    var validateData = Joi.object({
      content: Joi.string().required(),
      author: Joi.string().regex(myregexp).required(),
      post: Joi.string().regex(myregexp).required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const { content, author, post } = req.body;

    let newPostData;
    try {
      newPostData = new Comment({
        content,
        author,
      });
      await newPostData.save();
    } catch (err) {
      return next(err);
    }
    let newPostId;

    try {
      newPostId = await Post.findOne({ _id: post });
      newPostId.comments.push(newPostData);
      await newPostId.save();
    } catch (err) {
      return next(err);
    }
    // const newPost = new PostDto(newPostData);
    return res.status(201).json({ post: newPostData });
  },

  async commentList(req, res, next) {
    var validateData = Joi.object({
      post: Joi.string().regex(myregexp).required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const { post } = req.body;
    let commentsList;
    try {
      commentsList = await Comment.find({ post: post });
    } catch (err) {
      return next(err);
    }
    // const newPost = new PostDtoById(newPostData);
    return res.status(200).json({ comments: commentsList });
  },

  async postLike(req, res, next) {
    var validateData = Joi.object({
      isLike: Joi.boolean().required(),
      author: Joi.string().regex(myregexp).required(),
      post: Joi.string().regex(myregexp).required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const { isLike, author, post } = req.body;

    let newPostLike;
    try {
      newPostLike = new Likes({
        isLike,
        author,
      });
      await newPostLike.save();
    } catch (err) {
      return next(err);
    }
    let newPostId;

    try {
      newPostId = await Post.findOne({ _id: post });
      newPostId.likes.push(newPostLike);
      await newPostId.save();
    } catch (err) {
      return next(err);
    }
    // const newPost = new PostDto(newPostData);
    return res.status(201).json({ post: newPostLike });
  },
};
module.exports = PostController;
