const Joi = require("joi");
const Task = require("../modal/Task");
const TaskDto = require("../dto/taskDTo");
var myregexp = /^[0-9a-fA-F]{24}$/;

const TasksController = {
  async addTask(req, res, next) {
    var validateData = Joi.object({
      summary: Joi.string().required(),
      descriptions: Joi.string().required(),
      due_date: Joi.date().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }

    const { summary, descriptions, user, due_date } = req.body;

    let newTaskData;
    try {
      newTaskData = new Task({
        summary,
        descriptions,
        user: req.user._id,
        due_date,
        is_completed: false,
      });
      await newTaskData.save();
    } catch (err) {
      return next(err);
    }
    const newTask = new TaskDto(newTaskData);
    return res.status(201).json({ task: newTask });
  },

  async getTask(req, res, next) {
    let newTaskData;
    try {
      newTaskData = await Task.find({ user: req.user._id });
      let completedData = newTaskData.filter((item) => item.is_completed);
      let inCompletedData = newTaskData.filter((item) => !item.is_completed);

      return res.status(200).json({
        tasks: {
          completed: completedData,
          inCompleted: inCompletedData,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
  async updateTask(req, res, next) {
    var validateData = Joi.object({
      is_completed: Joi.boolean().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const id = req.params.id;

    const { is_completed } = req.body;

    let newTaskData;

    try {
      newTaskData = await Task.findOneAndUpdate(
        { _id: id },
        {
          is_completed,
        },
        {
          new: true,
        }
      );
    } catch (err) {
      return next(err);
    }
    // const newPost = new PostDto(newPostData);
    return res.status(200).json({ task: newTaskData });
  },
  async deleteTask(req, res, next) { 
   const id = req.params.id;
    let newTaskData;
    try {
      newTaskData = await Task.findByIdAndDelete(
        { _id: id },
        {
          new: true,
        }
      );
    } catch (err) {
      return next(err);
    }
    // const newPost = new PostDto(newPostData);
    return res.status(200).json({ task: newTaskData });
  },
};
module.exports = TasksController;
