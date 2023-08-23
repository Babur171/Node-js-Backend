const User = require("../modal/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const jwt = require("jsonwebtoken");
const { SECRETTOKEN } = require("../config/index");

const UserController = {
  async register(req, res, next) {
    var validateUser = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      gender: Joi.boolean().required(),
    });
    const { error } = validateUser.validate(req.body);
    if (error) {
      next(error);
    }
    const { username, email, password, gender } = req.body;
    try {
      const emailExist = await User.exists({ email: email });
      console.log("emailExistemailExist", emailExist);
      if (emailExist) {
        const error = {
          status: 209,
          message: "Email allready exist",
        };
        console.log("errorerror", error);
        return next(error);
      }
    } catch (err) {
      console.log("hasPasswordhasPassword", err);
      return next(err);
    }

    let user;
    try {
      const hasPassword = await bcrypt.hash(password, 10);

      user = new User({
        username: username,
        email: email,
        password: hasPassword,
        gender: gender,
      });
      await user.save();
    } catch (error) {
      console.log("catch");
      return next(error);
    }
    return res.status(201).json({ user: user });
  },
  async login(req, res, next) {
    var validateUser = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error } = validateUser.validate(req.body);
    if (error) {
      next(error);
    }
    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({ email });
      if (!user) {
        let error = {
          status: 401,
          message: "Email not found",
        };
        return next(error);
      }
      let pass = await bcrypt.compare(password, user.password);
      if (!pass) {
        let error = {
          status: 401,
          message: "Wronge password",
        };
        return next(error);
      }
    } catch (error) {
      console.log("catch");
      return next(error);
    }
    let accessToken = jwt.sign({ id: user._id }, SECRETTOKEN);
    const newUser = new UserDto(user);
    return res.status(201).json({ user: newUser, accessToken: accessToken });
  },
};
module.exports = UserController;
