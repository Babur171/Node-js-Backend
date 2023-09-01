const Joi = require("joi");
const CurrentLocation = require("../modal/CurrentLocation");
const PreviousLocation = require("../modal/PreviousLocation");

var myregexp = /^[0-9a-fA-F]{24}$/;

const LocationsController = {
  async checkIn(req, res, next) {
    var validateData = Joi.object({
      address: Joi.string().required(),
      latitude: Joi.string().required(),
      longitude: Joi.string().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }

    const { address, latitude, longitude } = req.body;

    let userCurrentLocation;
    try {
      let checkPre = await PreviousLocation.findOne({
        $and: [{ address }, { latitude }, { longitude }],
      });
      userCurrentLocation = await CurrentLocation.findOneAndUpdate(
        { user: req.user._id },
        {
          address,
          latitude,
          user: req.user._id,
          longitude,
        },
        { new: true }
      );

      if (!userCurrentLocation) {
        let current = new CurrentLocation({
          address,
          latitude,
          user: req.user._id,
          longitude,
        });
        userCurrentLocation = await current.save();
      }

      if (!checkPre) {
        newTaskData = new PreviousLocation({
          address,
          latitude,
          user: req.user._id,
          longitude,
        });
        await newTaskData.save();
        // const newTask = new TaskDto(newTaskData);
        return res
          .status(201)
          .json({ task: { userCurrentLocation, newTaskData } });
      } else {
        return res.status(201).json({ task: "addedd" });
      }
    } catch (err) {
      return next(err);
    }
  },

  async getCheckIn(req, res, next) {
    let currentChecIn;
    let previousCheckIn;

    try {
      currentChecIn = await CurrentLocation.findOne({ user: req.user._id });
      previousCheckIn = await PreviousLocation.find({ user: req.user._id });

      return res.status(200).json({
        tasks: {
          current: currentChecIn,
          previous: previousCheckIn,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
};
module.exports = LocationsController;
