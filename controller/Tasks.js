const Joi = require("joi");
const Task = require("../modal/Task");
const TaskDto = require("../dto/taskDTo");
var myregexp = /^[0-9a-fA-F]{24}$/;
var admin = require("firebase-admin");
const DeviceModal = require("../modal/Devices");
const Notification = require("../modal/Notifications");

var serviceAccount = require("../firebase/serviceAccountKey.json");

const firebaseAsmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

  async addDevice(req, res, next) {
    let deviceObject = Joi.object({
      device_name: Joi.string().required(),
      device_token: Joi.string().required(),
    });
    const { error } = deviceObject.validate(req.body);
    if (error) {
      next(error);
    }
    const { device_name, device_token } = req.body;

    let deviceDate;
    try {
      const alreadyDevice = await DeviceModal.exists({ device_token });
      if (alreadyDevice) {
        return res.status(201).json({ task: "Alreay found id" });
      } else {
        deviceDate = new DeviceModal({
          device_name,
          device_token,
          user: req.user._id,
        });

        const saveDevice = await deviceDate.save();
        return res.status(201).json({ task: saveDevice });
      }
    } catch (error) {
      return next(error);
    }
  },

  async addNotification(req, res, next) {
    let deviceObject = Joi.object({
      device_token: Joi.string().required(),
    });
    const { error } = deviceObject.validate(req.body);
    if (error) {
      next(error);
    }
    const { device_token } = req.body;
    try {
      firebaseAsmin.messaging().send({
        token: device_token,
        notification: {
          title: "Add task",
          body: "new task has been added",
        },
      });
      const notifcationData = new Notification({
        title: "Add task",
        content: "New task has been added",
        is_read: false,
        user: req.user._id,
      });
      await notifcationData.save();

      return res.status(201).json({ notification: "notification submited" });
    } catch (err) {
      return next(err);
    }
  },

  async getNotification(req, res, next) {
    let notifications;
    try {
      notifications = await Notification.find({ user: req.user._id });
      return res.status(201).json({ notifications: notifications });
    } catch (err) {
      return next(err);
    }
  },
  async updateNotification(req, res, next) {
    let deviceObject = Joi.object({
      is_read: Joi.boolean().required(),
    });
    const { error } = deviceObject.validate(req.body);
    if (error) {
      next(error);
    }
    const id = req.params.id;
    let notifications;

    try {
      notifications = await Notification.findByIdAndUpdate(
        { _id: id },
        { is_read: req.body.is_read },
        { new: true }
      );
      return res.status(201).json({ notification: notifications });
    } catch (err) {
      return next(err);
    }
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
