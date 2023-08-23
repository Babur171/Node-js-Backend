const Joi = require("joi");
const Post = require("../modal/Post");
const PostDto = require("../dto/postdto");
const PostDtoById = require("../dto/postdtoById");
var myregexp = /^[0-9a-fA-F]{24}$/;

const PostController = {
  async addPosts(req, res, next) {
    var validateData = Joi.object({
      content: Joi.string().required(),
      title: Joi.string().required(),
      author: Joi.string().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const { title, content, author } = req.body;
    let newPostData;
    try {
      newPostData = new Post({
        title,
        content,
        author,
      });
      await newPostData.save();
    } catch (err) {
      return next(err);
    }
    const newPost = new PostDto(newPostData);
    return res.status(201).json({ post: newPost });
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
      newPostData = await Post.findById({ _id: id }).populate("author");
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
    return res.status(201).json({ post: newPost });
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
    return res.status(201).json({ post: { message: "deleteed" } });
  },
};
module.exports = PostController;
