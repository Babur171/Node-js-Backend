const User = require("../modal/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const jwt = require("jsonwebtoken");
const { SECRETTOKEN } = require("../config/index");
const axios = require("axios");

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
      if (emailExist) {
        const error = {
          status: 209,
          message: "Email allready exist",
        };
        return next(error);
      }
    } catch (err) {
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
      return next(error);
    }
    let accessToken = jwt.sign({ id: user._id }, SECRETTOKEN, {
      expiresIn: "24h",
    });

    const newUser = new UserDto(user);
    return res.status(201).json({ user: newUser, accessToken: accessToken });
  },
  async googleLogin(req, res, next) {
    if (req.isAuthenticated()) {
      const { emails, id, displayName } = req.user;
      let user = {
        _id: id,
        email: emails[0]?.value,
        username: displayName,
      };

      let accessToken = jwt.sign({ id }, SECRETTOKEN, {
        expiresIn: "24h",
      });

      const newUser = new UserDto(user);
      return res.status(201).json({ user: newUser, accessToken: accessToken });
    }
  },
  async googleLoginApi(req, res, next) {
    const { token } = req.body;
    try {
      const ticket = await axios({
        method: "GET",
        url:
          "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": "astrology-horoscope.p.rapidapi.com",
          "x-rapidapi-key": "yourapikey",
        },
      });
      return res.status(200).json({ user: ticket.data });
    } catch (error) {
      return next(error); // Token is invalid
    }
  },
};
module.exports = UserController;
